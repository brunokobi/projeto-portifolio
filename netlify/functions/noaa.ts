import type { Handler } from "@netlify/functions";

// NOAA feeds RSS — dados públicos de ciclones tropicais
const NOAA_FEEDS: Record<string, string> = {
  "index-at": "https://www.nhc.noaa.gov/index-at.xml", // Atlântico
  "index-ep": "https://www.nhc.noaa.gov/index-ep.xml", // Pacífico Leste
  "index-cp": "https://www.nhc.noaa.gov/index-cp.xml", // Pacífico Central
  "index-io": "https://www.nhc.noaa.gov/index-io.xml", // Oceano Índico
  "index-sh": "https://www.nhc.noaa.gov/index-sh.xml", // Hemisfério Sul
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300",
      },
      body: "",
    };
  }

  // Extrair o feed ID do path: /api/noaa/index-at.xml → index-at
  const pathSegments = event.rawPath?.split("/").filter(Boolean) || [];
  const feedFile = pathSegments[pathSegments.length - 1]?.replace(".xml", "");

  if (!feedFile || !NOAA_FEEDS[feedFile]) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Feed not found" }),
    };
  }

  const feedUrl = NOAA_FEEDS[feedFile];

  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        Accept: "application/rss+xml, application/atom+xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `NOAA returned ${res.status}` }),
      };
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
  } catch (error) {
    console.error(`NOAA fetch error for ${feedFile}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch NOAA data" }),
    };
  }
};
