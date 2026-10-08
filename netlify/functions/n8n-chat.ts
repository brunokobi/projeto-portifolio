import type { Handler } from "@netlify/functions";
import { getTracer, flushOtel, SpanStatusCode } from "./_otel";

/**
 * Proxy para o webhook público do workflow "chatBruno - Multi-Agente RAG" no n8n
 * (self-hosted, Oracle VPS). Mantém a URL real do n8n fora do bundle
 * do frontend — o ChatWidget (src/components/ChatWidget) fala só com esta
 * function, que repassa o body recebido e devolve a resposta do agente sem
 * transformar nada.
 *
 * Contrato (definido pelo Chat Trigger do n8n):
 * - Request:  POST { chatInput: string, sessionId: string }
 *   Qualquer outro formato (ex.: { message, language }) faz o workflow
 *   responder 500. O sessionId (UUID gerado por visita no frontend) é a chave
 *   da Memória de Conversa do workflow.
 * - Response: JSON { output: string } — texto da resposta do agente.
 * - Workflow fixo em português: não há campo de idioma no payload.
 *
 * Env: N8N_WEBHOOK_URL (variável do Netlify, obrigatória; sem ela retorna 500).
 * Timeout de 55s na chamada ao n8n; falha de rede/timeout retorna 502.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  console.log("[n8n-chat] N8N_WEBHOOK_URL value:", webhookUrl ? "CONFIGURADA" : "NÃO CONFIGURADA");

  if (!webhookUrl) {
    console.error("[n8n-chat] N8N_WEBHOOK_URL não configurada");
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "N8N_WEBHOOK_URL not configured" }),
    };
  }

  const tracer = getTracer("n8n-chat");
  const span = tracer?.startSpan("n8n_chat.proxy", {
    attributes: { "http.method": event.httpMethod ?? "POST" },
  });

  try {
    console.log("[n8n-chat] Enviando para:", webhookUrl);
    console.log("[n8n-chat] Body:", event.body);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body ?? "{}",
      signal: AbortSignal.timeout(55000),
    });

    const text = await res.text();
    console.log("[n8n-chat] Resposta status:", res.status);
    console.log("[n8n-chat] Resposta body:", text);

    span?.setAttribute("http.response_status_code", res.status);
    span?.setStatus(
      res.ok ? { code: SpanStatusCode.OK } : { code: SpanStatusCode.ERROR, message: `n8n retornou ${res.status}` }
    );

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: text,
    };
  } catch (error: unknown) {
    console.error("[n8n-chat] Erro ao chamar o webhook n8n:", error);
    span?.recordException(error as Error);
    span?.setStatus({ code: SpanStatusCode.ERROR });
    return {
      statusCode: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "n8n webhook unreachable",
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  } finally {
    span?.end();
    await flushOtel();
  }
};
