// Satélites em órbita — posição real calculada via SGP4 (satellite.js) a
// partir de TLEs públicos do CelesTrak (sem chave, CORS liberado). A ISS
// fica de fora daqui de propósito: já existe um tracker dedicado dela em
// `iss.ts` (atualiza mais rápido, 8s) — incluir de novo aqui duplicaria o
// marcador. Starlink tem 11 mil+ satélites ativos; amostramos um
// subconjunto espalhado (não só os primeiros, que ficariam concentrados no
// mesmo plano orbital de lançamento) pra dar variedade visual sem poluir o
// globo.
import * as satellite from "satellite.js";

const CELESTRAK_BASE = "https://celestrak.org/NORAD/elements/gp.php";
const TLE_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // TLEs mudam pouco; 2h é sobra de margem
const FETCH_TIMEOUT_MS = 20000;
const STARLINK_SAMPLE_SIZE = 40;

const SATELLITE_POLL_INTERVAL_MS = 10000; // Atualiza a cada 10s
export const SATELLITE_POLL_INTERVAL = SATELLITE_POLL_INTERVAL_MS;

export interface Satellite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altitude: number; // km
  type: "iss" | "starlink" | "communication" | "navigation" | "weather";
  velocity: number; // km/s
}

interface RawSatellite {
  id?: unknown;
  name?: unknown;
  lat?: unknown;
  lon?: unknown;
  altitude?: unknown;
  type?: unknown;
  velocity?: unknown;
}

export function parseSatellites(json: unknown): Satellite[] {
  if (!Array.isArray(json)) return [];

  const satellites: Satellite[] = [];
  for (const s of json as RawSatellite[]) {
    if (typeof s?.lat !== "number" || typeof s?.lon !== "number" || typeof s?.name !== "string") continue;
    satellites.push({
      id: typeof s.id === "string" ? s.id : String(Math.random()),
      name: s.name,
      lat: s.lat,
      lon: s.lon,
      altitude: typeof s.altitude === "number" ? s.altitude : 400,
      type: (typeof s.type === "string" ? s.type : "communication") as Satellite["type"],
      velocity: typeof s.velocity === "number" ? s.velocity : 7.66,
    });
  }
  return satellites;
}

interface TleEntry {
  name: string;
  line1: string;
  line2: string;
  type: Satellite["type"];
}

interface CachedGroup {
  entries: TleEntry[];
  fetchedAt: number;
}

const groupCache = new Map<string, CachedGroup>();

function amostrarEspacado<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const passo = arr.length / n;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * passo)]);
  return out;
}

function parseTleText(texto: string, tipo: Satellite["type"]): TleEntry[] {
  const linhas = texto.split("\n").map((l) => l.trimEnd()).filter((l) => l.length > 0);
  const entries: TleEntry[] = [];
  for (let i = 0; i + 2 < linhas.length + 1 && i + 2 <= linhas.length; i += 3) {
    const name = linhas[i]?.trim();
    const line1 = linhas[i + 1];
    const line2 = linhas[i + 2];
    if (!name || !line1?.startsWith("1 ") || !line2?.startsWith("2 ")) continue;
    entries.push({ name, line1, line2, type: tipo });
  }
  return entries;
}

async function fetchGroup(group: string, tipo: Satellite["type"]): Promise<TleEntry[]> {
  const cached = groupCache.get(group);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < TLE_CACHE_TTL_MS) {
    return cached.entries;
  }

  try {
    const url = `${CELESTRAK_BASE}?GROUP=${group}&FORMAT=tle`;
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return cached?.entries ?? [];
    const texto = await res.text();
    const entries = parseTleText(texto, tipo);
    // CelesTrak às vezes responde 200 com uma mensagem de texto tipo "GP data
    // has not updated..." em vez do TLE (cortesia deles pra evitar pedir o
    // mesmo grupo com frequência maior que a atualização real, a cada 2h).
    // Nesse caso entries sai vazio — mantém o cache anterior em vez de
    // zerar os satélites, e não atualiza fetchedAt (tenta de novo mais cedo).
    if (entries.length === 0 && cached) {
      return cached.entries;
    }
    groupCache.set(group, { entries, fetchedAt: now });
    return entries;
  } catch {
    return cached?.entries ?? [];
  }
}

function propagarParaSatelite(entry: TleEntry, idSufixo: string): Satellite | null {
  try {
    const satrec = satellite.twoline2satrec(entry.line1, entry.line2);
    const agora = new Date();
    const pv = satellite.propagate(satrec, agora);
    if (!pv || typeof pv.position === "boolean" || typeof pv.velocity === "boolean") return null;

    const gmst = satellite.gstime(agora);
    const geo = satellite.eciToGeodetic(pv.position, gmst);
    const lat = satellite.degreesLat(geo.latitude);
    const lon = satellite.degreesLong(geo.longitude);
    const velocidade = Math.sqrt(pv.velocity.x ** 2 + pv.velocity.y ** 2 + pv.velocity.z ** 2);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(geo.height)) return null;

    return {
      id: `${entry.type}-${idSufixo}`,
      name: entry.name,
      lat,
      lon,
      altitude: geo.height,
      type: entry.type,
      velocity: velocidade,
    };
  } catch {
    return null;
  }
}

export async function loadSatellites(): Promise<Satellite[]> {
  const [gps, galileo, weather] = await Promise.all([
    fetchGroup("gps-ops", "navigation"),
    fetchGroup("galileo", "navigation"),
    fetchGroup("weather", "weather"),
  ]);

  const todos = [...gps, ...galileo, ...weather];

  const satellites: Satellite[] = [];
  todos.forEach((entry, i) => {
    const s = propagarParaSatelite(entry, String(i));
    if (s) satellites.push(s);
  });

  return satellites;
}

/** Cor por tipo de satélite */
export function satelliteColor(type: Satellite["type"]): string {
  switch (type) {
    case "iss":
      return "#00FF00"; // Verde brilhante
    case "starlink":
      return "#0099FF"; // Azul Starlink
    case "communication":
      return "#FF9900"; // Laranja
    case "navigation":
      return "#FF00FF"; // Magenta
    case "weather":
      return "#00FFFF"; // Cyan
    default:
      return "#FFFFFF";
  }
}

/** Raio do ícone (baseado altitude e tipo) */
export function satelliteRadius(altitude: number, type: Satellite["type"]): number {
  const base = type === "iss" ? 6 : type === "starlink" ? 3 : 4;
  return Math.max(2, Math.min(base, 8));
}

/** Label do satélite */
export function satelliteLabel(type: Satellite["type"]): string {
  const labels: Record<Satellite["type"], string> = {
    iss: "ISS",
    starlink: "Starlink",
    communication: "Comm",
    navigation: "Nav",
    weather: "Weather",
  };
  return labels[type];
}
