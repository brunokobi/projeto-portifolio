// Posição real da Estação Espacial Internacional — wheretheiss.at, sem
// chave, CORS liberado. (api.open-notify.org, a alternativa mais famosa,
// está fora do ar — testado antes de escolher essa.)

const ISS_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const FETCH_TIMEOUT_MS = 10000;
export const ISS_POLL_INTERVAL_MS = 8000; // a ISS se move rápido (~7.66km/s) — atualiza com frequência

export interface IssPosition {
  lat: number;
  lon: number;
}

export function parseIssPosition(json: unknown): IssPosition | null {
  const data = json as { latitude?: unknown; longitude?: unknown };
  const lat = data?.latitude;
  const lon = data?.longitude;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

export async function loadIssPosition(): Promise<IssPosition | null> {
  try {
    const res = await fetch(ISS_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    return parseIssPosition(await res.json());
  } catch {
    return null;
  }
}
