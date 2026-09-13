import type { Handler } from "@netlify/functions";
import { getTracer, flushOtel, SpanStatusCode } from "./_otel";
import { FEEDS } from "../../src/pages/News/newsConstants";

// Allowlist derivada dos 52 feeds RSS reais consumidos pelo painel de notícias.
// Sem isso, esta function é um proxy HTTP aberto: qualquer um poderia usar
// ?url= pra fazer o servidor buscar (e devolver, com CORS liberado) qualquer
// URL arbitrária — SSRF / relay anônimo.
const ALLOWED_HOSTS = new Set(FEEDS.map((f) => new URL(f.url).hostname.toLowerCase()));

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  const feedUrl = event.queryStringParameters?.url;
  if (!feedUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing url param" }) };
  }

  let parsed: URL;
  try {
    parsed = new URL(feedUrl);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid url" }) };
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
    return { statusCode: 403, body: JSON.stringify({ error: "Host not allowed" }) };
  }

  const tracer = getTracer("news");
  const span = tracer?.startSpan("news.proxy", {
    attributes: {
      "rss.feed_url": feedUrl,
      "http.method": "GET",
    },
  });

  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BrunoKobiPortfolio/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    span?.setAttribute("http.response_status_code", res.status);

    if (!res.ok) {
      span?.setStatus({ code: SpanStatusCode.ERROR, message: `Feed returned ${res.status}` });
      return { statusCode: res.status, body: JSON.stringify({ error: "Feed unavailable" }) };
    }

    const xml = await res.text();
    span?.setAttribute("rss.response_bytes", xml.length);
    span?.setStatus({ code: SpanStatusCode.OK });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
      body: xml,
    };
  } catch (err: unknown) {
    console.error("[news] Proxy error:", err);
    span?.recordException(err as Error);
    span?.setStatus({ code: SpanStatusCode.ERROR });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Proxy error",
        message: err instanceof Error ? err.message : String(err),
      }),
    };
  } finally {
    span?.end();
    await flushOtel();
  }
};
