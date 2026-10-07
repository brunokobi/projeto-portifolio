// Furacões - Dados de tempestades tropicais em tempo real
// Fonte: NOAA (National Hurricane Center) - Dados oficiais, sem autenticação

const FETCH_TIMEOUT_MS = 30000;
const HURRICANE_POLL_INTERVAL_MS = 30000; // Atualiza a cada 30s

// NOAA feeds via Netlify proxy (/api/noaa/*) — resolve CORS bloqueado
// Feeds disponíveis: Atlântico, Pacíficos
const NOAA_RSS_FEEDS = [
  "/api/noaa/index-at.xml", // Atlântico (Furacões/Tropical Storms/Depressions)
  "/api/noaa/index-ep.xml", // Pacífico Leste (Furacões/Tropical Storms)
  "/api/noaa/index-cp.xml", // Pacífico Central (Tufões/Tropical Storms)
];

// Cache pra evitar múltiplas requisições simultâneas
let cachedHurricanes: Hurricane[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // Cache por 60 segundos

export const HURRICANE_POLL_INTERVAL = HURRICANE_POLL_INTERVAL_MS;

export interface Hurricane {
  id: string;
  name: string;
  lat: number;
  lon: number;
  windSpeed: number; // km/h
  pressure: number; // mb
  category: number; // 0-5
  movement: string; // direção (NW, SE, etc)
}

interface RawHurricane {
  id?: unknown;
  name?: unknown;
  lat?: unknown;
  lon?: unknown;
  windSpeed?: unknown;
  pressure?: unknown;
  category?: unknown;
  movement?: unknown;
}

export function parseHurricanes(json: unknown): Hurricane[] {
  if (!Array.isArray(json)) return [];

  const hurricanes: Hurricane[] = [];
  for (const h of json as RawHurricane[]) {
    if (typeof h?.lat !== "number" || typeof h?.lon !== "number" || typeof h?.name !== "string") continue;
    hurricanes.push({
      id: typeof h.id === "string" ? h.id : String(Math.random()),
      name: h.name,
      lat: h.lat,
      lon: h.lon,
      windSpeed: typeof h.windSpeed === "number" ? h.windSpeed : 0,
      pressure: typeof h.pressure === "number" ? h.pressure : 0,
      category: typeof h.category === "number" ? h.category : 0,
      movement: typeof h.movement === "string" ? h.movement : "N/A",
    });
  }
  return hurricanes;
}

async function fetchNOAARSSFeed(url: string): Promise<Document | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) return null;
    return doc;
  } catch {
    return null;
  }
}

function parseNOAACyclones(doc: Document): Hurricane[] {
  const cyclones: Hurricane[] = [];
  const items = doc.getElementsByTagName("item");

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const nhcCyclone = item.getElementsByTagName("nhc:Cyclone")[0];
    if (!nhcCyclone) continue;

    const centerText = nhcCyclone.getElementsByTagName("nhc:center")[0]?.textContent || "";
    const [latStr, lonStr] = centerText.split(",").map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) continue;

    const name = nhcCyclone.getElementsByTagName("nhc:name")[0]?.textContent || "Storm";
    const typeEl = nhcCyclone.getElementsByTagName("nhc:type")[0]?.textContent || "";
    const windStr = nhcCyclone.getElementsByTagName("nhc:wind")[0]?.textContent || "0";
    const pressureStr = nhcCyclone.getElementsByTagName("nhc:pressure")[0]?.textContent || "1013";

    const windMph = parseInt(windStr) || 0;
    const windKmh = Math.round(windMph * 1.60934);
    const pressure = parseInt(pressureStr) || 1013;

    // Saffir-Simpson: 74+ mph (119 km/h) = Cat 1, 96+ (154) = Cat 2, etc.
    let category = 0;
    if (windMph >= 157) category = 5;
    else if (windMph >= 130) category = 4;
    else if (windMph >= 111) category = 3;
    else if (windMph >= 96) category = 2;
    else if (windMph >= 74) category = 1;

    cyclones.push({
      id: `noaa-${name}-${lat}-${lon}`,
      name,
      lat,
      lon,
      windSpeed: windKmh,
      pressure,
      category,
      movement: typeEl,
    });
  }

  return cyclones;
}

export async function loadHurricanes(): Promise<Hurricane[]> {
  // Retorna cache se ainda está válido
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedHurricanes;
  }

  try {
    const allStorms: Hurricane[] = [];

    for (const feedUrl of NOAA_RSS_FEEDS) {
      const doc = await fetchNOAARSSFeed(feedUrl);
      if (doc) {
        const cyclones = parseNOAACyclones(doc);
        allStorms.push(...cyclones);
      }
    }

    // Atualiza cache
    cachedHurricanes = allStorms;
    cacheTimestamp = now;

    return allStorms;
  } catch {
    return cachedHurricanes;
  }
}


/** Cor por categoria de furacão (Saffir-Simpson scale) */
export function hurricaneColor(category: number): string {
  if (category >= 5) return "#8B0000"; // Dark red - Cat 5
  if (category === 4) return "#FF0000"; // Red - Cat 4
  if (category === 3) return "#FF6600"; // Orange - Cat 3
  if (category === 2) return "#FFCC00"; // Yellow - Cat 2
  if (category === 1) return "#00CCFF"; // Cyan - Cat 1
  return "#FFFF00"; // Yellow - Tropical Storm
}

/** Raio do ícone do furacão (px) — 2x maior que vulcões/terremotos, 25% menor */
export function hurricaneRadius(windSpeed: number): number {
  return (8 + Math.max(0, Math.min(windSpeed / 50, 8)) * 2) * 2 * 0.75;
}

/** Label da categoria */
export function hurricaneLabel(category: number): string {
  if (category >= 5) return "Cat 5";
  if (category >= 1) return `Cat ${category}`;
  return "Tropical Storm";
}

/** Desenha ícone de furacão no canvas */
export function drawHurricaneIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  name: string
): void {
  ctx.save();
  ctx.translate(x, y);

  // Espiral contínua (redemoinho limpo)
  ctx.strokeStyle = color;
  ctx.lineWidth = radius * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  // Desenha espiral (3 voltas)
  ctx.beginPath();
  for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
    const r = (angle / (Math.PI * 6)) * radius;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (angle === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Núcleo circular
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();

  // Label com nome do furacão
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = color;
  ctx.shadowBlur = 4;
  ctx.shadowColor = color;
  ctx.fillText(name.toUpperCase(), x + radius + 8, y + 3);
  ctx.shadowBlur = 0;
}
