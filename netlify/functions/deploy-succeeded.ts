import type { Handler } from "@netlify/functions";
import { INDEXNOW_ENDPOINT, SITE_URL, buildIndexNowBody, isProductionDeploy, parseSitemapUrls } from "../lib/indexNow";

// O Netlify chama esta function sozinho depois de cada deploy que dá certo.
// Em produção, avisa o IndexNow (Bing, Yandex, Seznam, Naver...) de todas as URLs do sitemap.
export const handler: Handler = async (event) => {
  if (!isProductionDeploy(event.body)) return { statusCode: 200, body: "ignorado: não é produção" };

  try {
    const sitemap = await fetch(`${SITE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(8000) });
    if (!sitemap.ok) throw new Error(`sitemap respondeu ${sitemap.status}`);
    const urls = parseSitemapUrls(await sitemap.text());
    if (!urls.length) throw new Error("sitemap sem URLs");

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(buildIndexNowBody(urls)),
      signal: AbortSignal.timeout(8000),
    });
    console.warn(`[indexnow] ${urls.length} URLs enviadas, resposta ${res.status}`);
    return { statusCode: 200, body: `indexnow ${res.status}` };
  } catch (err) {
    console.error("[indexnow] falhou", err);
    return { statusCode: 200, body: "indexnow falhou" };
  }
};
