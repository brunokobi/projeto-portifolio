import type { Handler } from "@netlify/functions";

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

  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BrunoKobiPortfolio/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: "Feed unavailable" }) };
    }

    const xml = await res.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
      body: xml,
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Proxy error", message: err.message }),
    };
  }
};
