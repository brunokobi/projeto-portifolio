import type { Article } from "../../types";
import {
  SOURCE_PRESTIGE,
  KW_CRITICAL,
  KW_HIGH,
  KW_MED,
  SPAM_WORDS,
  MIXED_SOURCES,
  AI_DEV_KEYWORDS,
  HERO_SCIENCE_BOOST,
  GREEN,
} from "./newsConstants";

const CUTOFF_2025 = new Date("2025-01-01").getTime();
export const HERO_MAX_AGE_MS = 7 * 24 * 3_600_000;

export function isTooOld(a: Article, cutoffMs = CUTOFF_2025): boolean {
  if (!a.date) return false;
  return a.date.getTime() < cutoffMs;
}

export function isSpam(a: Article): boolean {
  const t = (a.title || "").toLowerCase();
  return SPAM_WORDS.some((w) => t.includes(w));
}

export function isRelevant(a: Article): boolean {
  const text = ((a.title || "") + " " + (a.desc || "")).toLowerCase();
  return AI_DEV_KEYWORDS.some((kw) => text.includes(kw));
}

export function scoreArticle(a: Article): number {
  let s = SOURCE_PRESTIGE[a.source?.name] || 5;
  if (a.date && !isNaN(a.date as unknown as number)) {
    const h = (Date.now() - (a.date as unknown as number)) / 3_600_000;
    s += h < 2 ? 40 : h < 6 ? 33 : h < 12 ? 25 : h < 24 ? 16 : h < 48 ? 8 : h < 96 ? 3 : 0;
  }
  const t = (a.title || "").toLowerCase();
  KW_CRITICAL.forEach((k) => {
    if (t.includes(k)) s += 18;
  });
  KW_HIGH.forEach((k) => {
    if (t.includes(k)) s += 10;
  });
  KW_MED.forEach((k) => {
    if (t.includes(k)) s += 4;
  });
  if (a.img) s += 6;
  return s;
}

export function heroScore(a: Article): number {
  let s = SOURCE_PRESTIGE[a.source?.name] || 5;
  if (HERO_SCIENCE_BOOST.has(a.source?.name)) s += 25;
  const t = (a.title || "").toLowerCase();
  KW_CRITICAL.forEach((k) => {
    if (t.includes(k)) s += 18;
  });
  KW_HIGH.forEach((k) => {
    if (t.includes(k)) s += 10;
  });
  KW_MED.forEach((k) => {
    if (t.includes(k)) s += 4;
  });
  if (a.date && !isNaN(a.date as unknown as number)) {
    const h = (Date.now() - (a.date as unknown as number)) / 3_600_000;
    s += h < 1 ? 30 : h < 3 ? 25 : h < 6 ? 20 : h < 12 ? 14 : h < 24 ? 8 : h < 48 ? 3 : 0;
  }
  return s;
}

export function importanceLevel(
  score: number
): { label: string; color: string; icon: string } | null {
  if (score >= 65) return { label: "URGENTE", color: "#ff4444", icon: "🔥" };
  if (score >= 45) return { label: "DESTAQUE", color: "#ffaa00", icon: "⚡" };
  if (score >= 28) return { label: "RELEVANTE", color: GREEN, icon: "📌" };
  return null;
}

// Re-exporta para conveniência dos arquivos que precisam filtrar
export { MIXED_SOURCES };
