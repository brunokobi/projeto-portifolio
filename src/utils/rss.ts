import type { Feed } from "../types";

export const PROXY = "/.netlify/functions/news?url=";
export const CACHE_TTL = 5 * 60 * 1000;

// ── Boilerplate patterns ──────────────────────────────────────────────────
export const BOILERPLATE_PATTERNS = [
  /este trecho é parte de conteúdo que pode ser compartilhado[^.]*\./gi,
  /não reproduza o conteúdo d[oa][^.]*sem autorização\./gi,
  /para ler a matéria completa[^.]*\./gi,
  /leia mais em[^.]*\./gi,
  /acesse o conteúdo completo[^.]*\./gi,
  /veja o artigo completo[^.]*\./gi,
  /clique aqui para ler[^.]*\./gi,
  /the post .+ appeared first on .+/gi,
];

// ── Extrai URL de imagem de um item RSS ──────────────────────────────────
export function extractImage(item: Element): string | null {
  for (const tag of ["thumbnail", "content", "image"]) {
    for (const name of [`media:${tag}`, tag]) {
      const els = item.getElementsByTagName(name);
      for (let i = 0; i < els.length; i++) {
        const u = els[i].getAttribute("url");
        if (u && /^https?:\/\//i.test(u)) return u;
      }
    }
  }
  const enc = item.getElementsByTagName("enclosure");
  for (let i = 0; i < enc.length; i++) {
    const t = enc[i].getAttribute("type") || "";
    const u = enc[i].getAttribute("url") || "";
    if (u && (t.startsWith("image") || /\.(jpe?g|png|gif|webp)$/i.test(u))) return u;
  }
  for (const sel of ["description", "content", "summary", "content:encoded"]) {
    const el = item.getElementsByTagName(sel)[0];
    if (!el) continue;
    const raw = el.textContent || "";
    const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m && /^https?:\/\//i.test(m[1])) return m[1];
    const mu = raw.match(/https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|gif|webp)/i);
    if (mu) return mu[0];
  }
  return null;
}

// ── Limpa descrição de boilerplate ────────────────────────────────────────
export function cleanDesc(raw: string): string {
  let text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const pat of BOILERPLATE_PATTERNS) text = text.replace(pat, "").trim();
  return text.slice(0, 180);
}

// ── Parseia XML RSS/Atom, retorna artigos sem source ─────────────────────
export function parseRSS(xml: string): Array<Omit<import("../types").Article, "source">> {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  let items = Array.from(doc.querySelectorAll("item"));
  if (!items.length) items = Array.from(doc.querySelectorAll("entry"));
  return items
    .slice(0, 8)
    .map((item) => {
      const gt = (tag: string) => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
      const title = gt("title");
      let link = gt("link");
      if (!link) {
        const el = item.querySelector("link[rel='alternate']") || item.querySelector("link");
        link = el?.getAttribute("href") || el?.textContent?.trim() || "";
      }
      const date = gt("pubDate") || gt("published") || gt("updated") || gt("dc:date");
      const img = extractImage(item);
      const rawDesc = gt("description") || gt("summary") || gt("content");
      const desc = cleanDesc(rawDesc);
      return { title, link, date: date ? new Date(date) : null, img: img || null, desc };
    })
    .filter((a) => a.title && a.link);
}

// ── Tempo relativo ────────────────────────────────────────────────────────
export function timeAgo(date: Date | null): string {
  if (!date || isNaN(date as unknown as number)) return "";
  const d = (Date.now() - date.getTime()) / 1000;
  if (d < 3600) return `${Math.floor(d / 60)}min`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  if (d < 604800) return `${Math.floor(d / 86400)}d`;
  return date.toLocaleDateString("pt-BR");
}

// ── Cache de traduções (sessão) ──────────────────────────────────────────
export const translationCache = new Map<string, string>();

export async function translateTitle(text: string): Promise<string> {
  if (translationCache.has(text)) return translationCache.get(text)!;
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=` +
      encodeURIComponent(text);
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const out = data[0]?.map((d: [string]) => d[0]).join("") || text;
    translationCache.set(text, out);
    return out;
  } catch {
    return text;
  }
}

export async function translateArticles<T extends { title: string; source: Feed }>(
  articles: T[]
): Promise<T[]> {
  const result = articles.map((a) => ({ ...a }));
  const idxs = result
    .map((a, i) => (a.source.flag === "🌎" ? i : -1))
    .filter((i) => i >= 0)
    .slice(0, 40);
  for (let b = 0; b < idxs.length; b += 5) {
    await Promise.all(
      idxs.slice(b, b + 5).map(async (idx) => {
        result[idx] = { ...result[idx], title: await translateTitle(result[idx].title) };
      })
    );
  }
  return result;
}
