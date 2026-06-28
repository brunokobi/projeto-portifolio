import { describe, it, expect } from "vitest";
import type { Article } from "../../../types";
import { isSpam, isRelevant, scoreArticle, importanceLevel } from "../newsFunctions";

const mockFeed = { name: "MIT Tech", url: "https://test.com", flag: "🌎", color: "#fff" };

function makeArticle(overrides: Partial<Article> = {}): Article & { score?: number } {
  return {
    title: "Claude 4 lança novo modelo de IA",
    link: "https://example.com/article",
    date: new Date(),
    img: null,
    source: mockFeed,
    score: 0,
    ...overrides,
  };
}

describe("isSpam", () => {
  it("retorna false para artigo legítimo", () => {
    expect(isSpam(makeArticle())).toBe(false);
  });

  it("retorna true para título com palavra de spam", () => {
    const spam = makeArticle({ title: "Promoção imperdível: smartwatch em oferta hoje" });
    expect(isSpam(spam)).toBe(true);
  });
});

describe("isRelevant", () => {
  it("retorna true para artigo com palavra-chave de IA", () => {
    const article = makeArticle({ title: "OpenAI lança novo modelo GPT" });
    expect(isRelevant(article)).toBe(true);
  });

  it("retorna false para artigo fora do tema", () => {
    const article = makeArticle({ title: "Receita de bolo de chocolate delicioso" });
    expect(isRelevant(article)).toBe(false);
  });
});

describe("scoreArticle", () => {
  it("artigo recente tem score maior que artigo antigo", () => {
    const recent = makeArticle({ date: new Date(Date.now() - 1 * 60 * 60 * 1000) }); // 1h atrás
    const old = makeArticle({ date: new Date(Date.now() - 100 * 60 * 60 * 1000) }); // 100h atrás
    expect(scoreArticle(recent)).toBeGreaterThan(scoreArticle(old));
  });

  it("artigo com imagem tem score maior que sem imagem (mesmas condições)", () => {
    const withImg = makeArticle({ img: "https://example.com/img.jpg" });
    const withoutImg = makeArticle({ img: null });
    expect(scoreArticle(withImg)).toBeGreaterThan(scoreArticle(withoutImg));
  });

  it("artigo com palavra crítica tem score alto", () => {
    const article = makeArticle({ title: "GPT-5 lançado: novo marco em inteligência artificial" });
    expect(scoreArticle(article)).toBeGreaterThan(20);
  });
});

describe("importanceLevel", () => {
  it("retorna URGENTE para score >= 65", () => {
    const lvl = importanceLevel(70);
    expect(lvl?.label).toBe("URGENTE");
    expect(lvl?.icon).toBe("🔥");
  });

  it("retorna DESTAQUE para score >= 45", () => {
    const lvl = importanceLevel(50);
    expect(lvl?.label).toBe("DESTAQUE");
    expect(lvl?.icon).toBe("⚡");
  });

  it("retorna RELEVANTE para score >= 28", () => {
    const lvl = importanceLevel(30);
    expect(lvl?.label).toBe("RELEVANTE");
    expect(lvl?.icon).toBe("📌");
  });

  it("retorna null para score baixo", () => {
    expect(importanceLevel(10)).toBeNull();
  });
});
