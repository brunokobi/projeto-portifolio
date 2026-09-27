// Vulcões reais — lista estática (localização não muda com o tempo, então
// não precisa de polling nem de API "viva"). Fonte: tabela de vulcões da
// Oregon State University, publicada por vasturiano (autor do globe.gl) em
// https://gist.github.com/vasturiano/3c27138769a04d1780562ce04afbedf2 —
// 425 vulcões, CORS liberado, sem chave.

const VOLCANOES_URL =
  "https://gist.githubusercontent.com/vasturiano/3c27138769a04d1780562ce04afbedf2/raw/83dde896972fad0f1f823191ea90e3d451d3977a/world_volcanoes.json";
const FETCH_TIMEOUT_MS = 10000;

export interface Volcano {
  name: string;
  country: string;
  type: string;
  lat: number;
  lon: number;
  elevation: number;
}

interface RawVolcano {
  name?: unknown;
  country?: unknown;
  type?: unknown;
  lat?: unknown;
  lon?: unknown;
  elevation?: unknown;
}

export function parseVolcanoes(json: unknown): Volcano[] {
  if (!Array.isArray(json)) return [];

  const volcanoes: Volcano[] = [];
  for (const v of json as RawVolcano[]) {
    if (typeof v?.lat !== "number" || typeof v?.lon !== "number" || typeof v?.name !== "string") continue;
    volcanoes.push({
      name: v.name,
      country: typeof v.country === "string" ? v.country : "",
      type: typeof v.type === "string" ? v.type : "",
      lat: v.lat,
      lon: v.lon,
      elevation: typeof v.elevation === "number" ? v.elevation : 0,
    });
  }
  return volcanoes;
}

export async function loadVolcanoes(): Promise<Volcano[]> {
  try {
    const res = await fetch(VOLCANOES_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return [];
    return parseVolcanoes(await res.json());
  } catch {
    return [];
  }
}

/** Cor por tipo de vulcão */
export function volcanoColor(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("shield")) return "#ff6b35";
  if (t.includes("composite") || t.includes("stratovolcano")) return "#f7931e";
  if (t.includes("cinder")) return "#fdb833";
  if (t.includes("caldera")) return "#c23b22";
  return "#ff9800"; // default
}

/** Raio do pin (px) pela elevação */
export function volcanoRadius(elevation: number): number {
  return 6 + Math.max(0, Math.min(elevation / 1000, 5)) * 2;
}
