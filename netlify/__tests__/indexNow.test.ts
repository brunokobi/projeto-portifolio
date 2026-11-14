import { describe, expect, it } from "vitest";
import { INDEXNOW_KEY, buildIndexNowBody, isProductionDeploy, parseSitemapUrls } from "../lib/indexNow";

describe("indexNow", () => {
  it("lê só as URLs do próprio site no sitemap", () => {
    const xml =
      "<urlset><url><loc>https://brunokobi.tech/</loc></url><url><loc>https://brunokobi.tech/blog/x</loc></url><url><loc>https://outro.com/a</loc></url></urlset>";
    expect(parseSitemapUrls(xml)).toEqual(["https://brunokobi.tech/", "https://brunokobi.tech/blog/x"]);
  });

  it("monta o pedido com a chave publicada no site", () => {
    const body = buildIndexNowBody(["https://brunokobi.tech/"]);
    expect(body.host).toBe("brunokobi.tech");
    expect(body.keyLocation).toBe(`https://brunokobi.tech/${INDEXNOW_KEY}.txt`);
    expect(body.urlList).toEqual(["https://brunokobi.tech/"]);
  });

  it("só reage a deploy de produção", () => {
    expect(isProductionDeploy(JSON.stringify({ payload: { context: "production" } }))).toBe(true);
    expect(isProductionDeploy(JSON.stringify({ payload: { context: "deploy-preview" } }))).toBe(false);
    expect(isProductionDeploy("não é json")).toBe(false);
    expect(isProductionDeploy(null)).toBe(false);
  });
});
