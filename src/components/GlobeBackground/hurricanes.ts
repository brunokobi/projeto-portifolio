// Furacões — posição observada mais recente de cada ciclone tropical ativo
// no mundo. Fonte: ArcGIS Living Atlas "Active Hurricanes, Cyclones and
// Typhoons" (esri_livefeeds2), que agrega NHC (Atlântico/Pacífico) + JTWC
// (demais bacias — Índico, Hemisfério Sul, Pacífico Oeste), atualizado a
// cada 15min. Cobre globo inteiro, ao contrário do RSS só-NOAA usado antes
// (trocado em 08/10/2026) — não precisa mais de proxy Netlify pra CORS,
// o serviço já libera CORS.
const HURRICANE_SERVICE_URL =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Active_Hurricanes_v1/FeatureServer/1/query";
const FETCH_TIMEOUT_MS = 20000;
const HURRICANE_POLL_INTERVAL_MS = 5 * 60 * 1000; // serviço atualiza a cada 15min, 5min é margem segura

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

interface EsriHurricaneAttrs {
  STORMID?: string | null;
  STORMNAME?: string | null;
  LAT?: number | null;
  LON?: number | null;
  INTENSITY?: number | null; // nós (kt)
  MSLP?: number | null; // mb — 0 quando a agência de origem (ex.: JTWC) não reporta
  SS?: number | null; // categoria Saffir-Simpson, 0-5 (-1/-2 = depressão/distúrbio, tratado como 0)
  DTG?: number | null; // epoch ms da observação
}

async function fetchEsriHurricanePositions(): Promise<EsriHurricaneAttrs[]> {
  const url = new URL(HURRICANE_SERVICE_URL);
  url.searchParams.set("where", "1=1");
  url.searchParams.set("outFields", "STORMID,STORMNAME,LAT,LON,INTENSITY,MSLP,SS,DTG");
  // STORMID,DTG DESC: agrupa por tempestade com a observação mais recente
  // primeiro — de-dup abaixo fica só com 1 (a mais recente) por STORMID.
  url.searchParams.set("orderByFields", "STORMID,DTG DESC");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("f", "json");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.error || !Array.isArray(data.features)) return [];
  return data.features.map((f: { attributes: EsriHurricaneAttrs }) => f.attributes);
}

export async function loadHurricanes(): Promise<Hurricane[]> {
  // Retorna cache se ainda está válido
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedHurricanes;
  }

  try {
    const posicoes = await fetchEsriHurricanePositions();

    const vistos = new Set<string>();
    const maisRecentes: EsriHurricaneAttrs[] = [];
    for (const p of posicoes) {
      if (!p.STORMID || vistos.has(p.STORMID)) continue;
      vistos.add(p.STORMID);
      maisRecentes.push(p);
    }

    const bruto = maisRecentes.map((p) => ({
      id: p.STORMID,
      name: p.STORMNAME,
      lat: p.LAT,
      lon: p.LON,
      windSpeed: typeof p.INTENSITY === "number" ? Math.round(p.INTENSITY * 1.852) : 0, // kt -> km/h
      pressure: p.MSLP || 0,
      category: typeof p.SS === "number" ? Math.max(0, p.SS) : 0,
      movement: "",
    }));

    const allStorms = parseHurricanes(bruto);

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
