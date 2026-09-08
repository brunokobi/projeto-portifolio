import type { Handler } from "@netlify/functions";
import { getTracer, flushOtel, SpanStatusCode } from "./_otel";

/**
 * Proxy para o webhook público do workflow "chatBruno - Multi-Agente RAG" no n8n
 * (self-hosted, AWS EC2 / Oracle VPS). Mantém a URL real do n8n fora do bundle
 * do frontend — o widget (@n8n/chat embedado no index.html) fala só com esta
 * function, que repassa o body recebido e devolve a resposta do agente.
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
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body ?? "{}",
      signal: AbortSignal.timeout(30000),
    });

    const text = await res.text();
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
