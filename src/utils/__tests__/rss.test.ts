import { describe, it, expect, vi, afterEach } from "vitest";
import { timeAgo, cleanDesc, parseRSS, BOILERPLATE_PATTERNS } from "../rss";

describe("timeAgo", () => {
  it("retorna string vazia para null", () => {
    expect(timeAgo(null)).toBe("");
  });

  it("retorna minutos para datas recentes", () => {
    const date = new Date(Date.now() - 30 * 60 * 1000); // 30 min atrás
    expect(timeAgo(date)).toBe("30min");
  });

  it("retorna horas para datas de horas atrás", () => {
    const date = new Date(Date.now() - 3 * 3600 * 1000); // 3h atrás
    expect(timeAgo(date)).toBe("3h");
  });

  it("retorna dias para datas de dias atrás", () => {
    const date = new Date(Date.now() - 2 * 86400 * 1000); // 2d atrás
    expect(timeAgo(date)).toBe("2d");
  });
});

describe("cleanDesc", () => {
  it("remove tags HTML", () => {
    const raw = "<p>Texto <b>em negrito</b> aqui</p>";
    expect(cleanDesc(raw)).toBe("Texto em negrito aqui");
  });

  it("remove padrões de boilerplate", () => {
    const raw = "Conteúdo real. Leia mais em nosso site.";
    const result = cleanDesc(raw);
    expect(result).not.toContain("Leia mais em");
  });

  it("trunca em 180 caracteres", () => {
    const long = "a".repeat(300);
    expect(cleanDesc(long).length).toBeLessThanOrEqual(180);
  });
});

describe("parseRSS", () => {
  it("retorna array vazio para XML inválido", () => {
    const result = parseRSS("not xml at all");
    expect(result).toEqual([]);
  });

  it("parseia feed RSS válido", () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Artigo de Teste</title>
      <link>https://example.com/artigo</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;
    const result = parseRSS(xml);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Artigo de Teste");
    expect(result[0].link).toBe("https://example.com/artigo");
    expect(result[0].date).toBeInstanceOf(Date);
  });

  it("parseia feed Atom válido", () => {
    const xml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Artigo Atom</title>
    <link href="https://example.com/atom"/>
    <published>2024-01-01T12:00:00Z</published>
  </entry>
</feed>`;
    const result = parseRSS(xml);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Artigo Atom");
  });

  it("filtra itens sem título ou link", () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item><title>Sem Link</title></item>
    <item><link>https://example.com/sem-titulo</link></item>
    <item><title>Com Tudo</title><link>https://example.com/ok</link></item>
  </channel>
</rss>`;
    const result = parseRSS(xml);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Com Tudo");
  });
});
