import type { Handler } from "@netlify/functions";
import { getTracer, flushOtel, SpanStatusCode } from "./_otel";

interface TrackPayload {
  event: string;
  page?: string;
  country_code?: string;
  city?: string;
  extra?: string;
}

const EMOJIS: Record<string, string> = {
  pageview: "👁",
  contact_opened: "📬",
  contact_sent: "✅",
  chat_opened: "🤖",
  map_opened: "🗺️",
  news_opened: "📰",
  link_click: "🔗",
};

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

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Telegram not configured" }),
    };
  }

  let payload: TrackPayload;
  try {
    payload = JSON.parse(event.body ?? "{}") as TrackPayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const tracer = getTracer("track");
  const span = tracer?.startSpan("track.handle", {
    attributes: {
      "track.event": payload.event,
      "track.page": payload.page ?? "",
      "track.country_code": payload.country_code ?? "",
      "track.city": payload.city ?? "",
    },
  });

  try {
    const emoji = EMOJIS[payload.event] ?? "📊";
    const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const lines = [
      `${emoji} *${payload.event.replace(/_/g, " ").toUpperCase()}*`,
      payload.page ? `📄 \`${payload.page}\`` : null,
      payload.city || payload.country_code
        ? `🌍 ${[payload.city, payload.country_code].filter(Boolean).join(" — ")}`
        : null,
      payload.extra ? `💬 ${payload.extra}` : null,
      `⏰ ${now}`,
    ]
      .filter(Boolean)
      .join("\n");

    const telegramSpan = tracer?.startSpan("telegram.sendMessage", {
      attributes: { "messaging.system": "telegram" },
    });

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "Markdown" }),
      });
      telegramSpan?.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      telegramSpan?.recordException(err as Error);
      telegramSpan?.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      telegramSpan?.end();
    }

    span?.setStatus({ code: SpanStatusCode.OK });
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("[track] Telegram error:", err);
    span?.recordException(err as Error);
    span?.setStatus({ code: SpanStatusCode.ERROR });
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to send" }),
    };
  } finally {
    span?.end();
    await flushOtel();
  }
};
