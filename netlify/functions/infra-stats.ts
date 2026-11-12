import type { Handler } from "@netlify/functions";
import { EMPRESAS_STATS_URL, parseDatasetStats, type DatasetStats } from "../lib/infraStats";

// A API do dataset não libera CORS, então o navegador não lê /estatisticas direto.
// Esta function busca só essa URL fixa (sem parâmetro, não vira proxy aberto) e
// guarda o resultado por 5 min.
const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

let cached: { stats: DatasetStats; fetchedAt: number } | null = null;

const json = (statusCode: number, body: unknown, maxAge: number) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": `public, max-age=${maxAge}`,
  },
  body: JSON.stringify(body),
});

export const handler: Handler = async () => {
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return json(200, { ...cached.stats, fetchedAt: new Date(cached.fetchedAt).toISOString() }, 300);
  }

  try {
    const res = await fetch(EMPRESAS_STATS_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`estatisticas respondeu ${res.status}`);
    const stats = parseDatasetStats(await res.json());
    if (!stats) throw new Error("estatisticas em formato inesperado");
    cached = { stats, fetchedAt: now };
    return json(200, { ...stats, fetchedAt: new Date(now).toISOString() }, 300);
  } catch (err) {
    console.error("[infra-stats]", err instanceof Error ? err.message : err);
    return json(502, { error: "dataset indisponível" }, 30);
  }
};
