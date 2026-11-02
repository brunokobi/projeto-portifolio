// Satélites em órbita — posição real calculada via SGP4 (satellite.js) a
// partir de TLEs públicos do CelesTrak (sem chave, CORS liberado). A ISS
// fica de fora daqui de propósito: já existe um tracker dedicado dela em
// `iss.ts`. Os TLEs ficam em cache por 2h (memória e localStorage); a posição é
// recalculada a cada chamada de loadSatellites(), então chamar a cada poucos
// segundos não gera requisição nova.
import * as satellite from "satellite.js";

const CELESTRAK_BASE = "https://celestrak.org/NORAD/elements/gp.php";
const TLE_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // TLEs mudam pouco; 2h é sobra de margem
const FETCH_TIMEOUT_MS = 20000;

export const SATELLITE_POLL_INTERVAL_MS = 10000;

export interface Satellite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altitude: number; // km
  type: "iss" | "communication" | "navigation" | "weather";
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

// O CelesTrak bloqueia no firewall o IP que repete pedidos com frequência.
// Por isso: TLE guardado também no localStorage (recarregar a página não pede
// de novo), um pedido por grupo por vez e, depois de uma falha, 30 min sem tentar.
const RETRY_AFTER_FAILURE_MS = 30 * 60 * 1000;
const STORAGE_PREFIX = "celestrak-tle:";

const groupCache = new Map<string, CachedGroup>();
const lastFailureAt = new Map<string, number>();
const inFlight = new Map<string, Promise<TleEntry[]>>();

export function resetSatelliteCache() {
  groupCache.clear();
  lastFailureAt.clear();
  inFlight.clear();
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage indisponível
  }
}

function readStoredGroup(group: string): CachedGroup | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + group);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<CachedGroup>;
    if (!Array.isArray(parsed.entries) || typeof parsed.fetchedAt !== "number") return undefined;
    return { entries: parsed.entries, fetchedAt: parsed.fetchedAt };
  } catch {
    return undefined;
  }
}

function saveGroup(group: string, cache: CachedGroup) {
  groupCache.set(group, cache);
  try {
    localStorage.setItem(STORAGE_PREFIX + group, JSON.stringify(cache));
  } catch {
    // localStorage cheio ou bloqueado: fica só o cache em memória
  }
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

async function requestGroup(group: string, tipo: Satellite["type"], cached?: CachedGroup): Promise<TleEntry[]> {
  const now = Date.now();
  try {
    const url = `${CELESTRAK_BASE}?GROUP=${group}&FORMAT=tle`;
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`CelesTrak respondeu ${res.status}`);
    const entries = parseTleText(await res.text(), tipo);
    if (entries.length === 0) {
      // Resposta 200 com "GP data has not updated...": o CelesTrak pede para
      // não repetir antes da próxima atualização, então o cache vale por mais 2h.
      if (cached) {
        saveGroup(group, { entries: cached.entries, fetchedAt: now });
        return cached.entries;
      }
      lastFailureAt.set(group, now);
      return [];
    }
    lastFailureAt.delete(group);
    saveGroup(group, { entries, fetchedAt: now });
    return entries;
  } catch {
    lastFailureAt.set(group, now);
    return cached?.entries ?? [];
  }
}

async function fetchGroup(group: string, tipo: Satellite["type"]): Promise<TleEntry[]> {
  const now = Date.now();
  let cached = groupCache.get(group);
  if (!cached) {
    cached = readStoredGroup(group);
    if (cached) groupCache.set(group, cached);
  }
  if (cached && now - cached.fetchedAt < TLE_CACHE_TTL_MS) return cached.entries;

  const failedAt = lastFailureAt.get(group);
  if (failedAt !== undefined && now - failedAt < RETRY_AFTER_FAILURE_MS) return cached?.entries ?? [];

  const pending = inFlight.get(group);
  if (pending) return pending;

  const request = requestGroup(group, tipo, cached).finally(() => inFlight.delete(group));
  inFlight.set(group, request);
  return request;
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
  const base = type === "iss" ? 6 : 4;
  return Math.max(2, Math.min(base, 8));
}

/** Label do satélite */
export function satelliteLabel(type: Satellite["type"]): string {
  const labels: Record<Satellite["type"], string> = {
    iss: "ISS",
    communication: "Comm",
    navigation: "Nav",
    weather: "Weather",
  };
  return labels[type];
}
