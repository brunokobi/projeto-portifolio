export const INDEXNOW_KEY = "43b8adcd357f69c1169dccd018e05242";
export const SITE_HOST = "brunokobi.tech";
export const SITE_URL = `https://${SITE_HOST}`;
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export function parseSitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((url) => url.startsWith(`${SITE_URL}/`));
}

export function buildIndexNowBody(urls: string[]) {
  return {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };
}

export function isProductionDeploy(eventBody: string | null): boolean {
  if (!eventBody) return false;
  try {
    const { payload } = JSON.parse(eventBody) as { payload?: { context?: string } };
    return payload?.context === "production";
  } catch {
    return false;
  }
}
