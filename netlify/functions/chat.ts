import type { Handler } from "@netlify/functions";

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
    console.error("[chat] N8N_WEBHOOK_URL não configurada");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "N8N_WEBHOOK_URL not configured" }),
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text();

    if (!response.ok) {
      console.error(`[chat] n8n retornou ${response.status}: ${text}`);
    }

    return {
      statusCode: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: text,
    };
  } catch (error: unknown) {
    const isAbort =
      error instanceof Error && error.name === "AbortError";
    console.error("[chat] Erro ao chamar n8n:", error);
    return {
      statusCode: 504,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: isAbort ? "n8n timeout" : "Proxy error",
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
