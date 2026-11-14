import { describe, expect, it } from "vitest";
import { isCrawler } from "../isCrawler";

describe("isCrawler", () => {
  it("reconhece robôs de busca e de prévia de link", () => {
    expect(isCrawler("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isCrawler("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true);
    expect(isCrawler("LinkedInBot/1.0 (compatible; Mozilla/5.0)")).toBe(true);
    expect(isCrawler("WhatsApp/2.23.20.0")).toBe(true);
  });

  it("não confunde um navegador comum com robô", () => {
    expect(
      isCrawler("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36")
    ).toBe(false);
  });
});
