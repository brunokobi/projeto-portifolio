import type { Article } from "../../types";
import {
  SOURCE_PRESTIGE,
  KW_CRITICAL,
  KW_HIGH,
  KW_MED,
  SPAM_WORDS,
  MIXED_SOURCES,
  AI_DEV_KEYWORDS,
  HERO_SOURCE_BONUS,
  HERO_KW_LAUNCH,
  HERO_KW_SPOTLIGHT,
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
  if (a.date) {
    const h = (Date.now() - a.date.getTime()) / 3_600_000;
    s += h < 2 ? 40 : h < 6 ? 33 : h < 12 ? 25 : h < 24 ? 16 : h < 48 ? 8 : h < 96 ? 3 : 0;
  }
  const t = (a.title || "").toLowerCase();
  KW_CRITICAL.forEach((k) => { if (t.includes(k)) s += 18; });
  KW_HIGH.forEach((k) => { if (t.includes(k)) s += 10; });
  KW_MED.forEach((k) => { if (t.includes(k)) s += 4; });
  if (a.img) s += 6;
  return s;
}

export function heroScore(a: Article): number {
  // Base tiered por fonte — diferencia labs primários de blogs acadêmicos
  let s = HERO_SOURCE_BONUS[a.source?.name] ?? SOURCE_PRESTIGE[a.source?.name] ?? 3;

  const t = (a.title || "").toLowerCase();

  // Palavras de lançamento/anúncio (cap 2 = máx +44)
  let launchHits = 0;
  for (const k of HERO_KW_LAUNCH) {
    if (launchHits >= 2) break;
    if (t.includes(k)) { s += 22; launchHits++; }
  }

  // Spotlight de empresa/modelo de alto impacto (cap 2 = máx +28)
  let spotHits = 0;
  for (const k of HERO_KW_SPOTLIGHT) {
    if (spotHits >= 2) break;
    if (t.includes(k)) { s += 14; spotHits++; }
  }

  // Recência forte — breaking news deve dominar o carrossel
  if (a.date) {
    const h = (Date.now() - a.date.getTime()) / 3_600_000;
    s += h < 2 ? 55 : h < 6 ? 44 : h < 12 ? 33 : h < 24 ? 20 : h < 48 ? 8 : 0;
  }

  // Tem descrição (melhor experiência visual no slide)
  if (a.desc && a.desc.length > 40) s += 4;

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
