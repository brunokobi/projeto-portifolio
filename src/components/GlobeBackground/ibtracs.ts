// src/components/GlobeBackground/ibtracs.ts
// IBTrACS Tropical Cyclone Loader - compatible with NOAA format

const IBTRACS_API = "https://ibtracs.brunokobi.duckdns.org/api/ibtracs";
const FETCH_TIMEOUT_MS = 30000;
const IBTRACS_POLL_INTERVAL_MS = 3600000; // 1 hour cache

let cachedIBTraCS: IBTraCS[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 3600000; // 1 hour

export const IBTRACS_POLL_INTERVAL = IBTRACS_POLL_INTERVAL_MS;

export interface IBTraCS {
  id: string;
  name: string;
  lat: number;
  lon: number;
  windSpeed: number; // km/h
  pressure: number; // mb
  time: string;
  type: string; // tropical storm, hurricane, typhoon, etc
}

export function parseIBTraCS(json: unknown): IBTraCS[] {
  if (!Array.isArray(json)) return [];

  const cyclones: IBTraCS[] = [];
  for (const c of json as any[]) {
    if (
      typeof c?.lat !== "number" ||
      typeof c?.lon !== "number" ||
      typeof c?.name !== "string"
    )
      continue;

    cyclones.push({
      id: typeof c.id === "string" ? c.id : String(Math.random()),
      name: c.name,
      lat: c.lat,
      lon: c.lon,
      windSpeed: typeof c.windSpeed === "number" ? c.windSpeed : 0,
      pressure: typeof c.pressure === "number" ? c.pressure : 1013,
      time: typeof c.time === "string" ? c.time : new Date().toISOString(),
      type: typeof c.type === "string" ? c.type : "tropical storm",
    });
  }

  return cyclones;
}

export async function loadIBTraCS(): Promise<IBTraCS[]> {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedIBTraCS;
  }

  try {
    const res = await fetch(IBTRACS_API, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];

    const data = parseIBTraCS(await res.json());
    cachedIBTraCS = data;
    cacheTimestamp = now;

    return data;
  } catch {
    return cachedIBTraCS;
  }
}

/** Cyclone type to category */
export function getCategory(type: string): number {
  const t = (type || "").toLowerCase();
  if (t.includes("hurricane") || t.includes("typhoon")) {
    return t.includes("major") ? 3 : 1;
  }
  if (t.includes("tropical storm")) return 0;
  return 0;
}

/** Color by cyclone type */
export function ibtracsColor(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("hurricane") || t.includes("typhoon")) return "#ff0000"; // Red
  if (t.includes("tropical storm")) return "#ffcc00"; // Yellow
  return "#ffff00"; // Default
}

/** Radius based on wind speed */
export function ibtracsRadius(windSpeed: number): number {
  return 8 + Math.max(0, Math.min(windSpeed / 50, 8)) * 2;
}

/** Label for cyclone */
export function ibtracsLabel(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("hurricane")) return "Hurricane";
  if (t.includes("typhoon")) return "Typhoon";
  if (t.includes("tropical storm")) return "Tropical Storm";
  return "Cyclone";
}

/** Draw cyclone icon on canvas */
export function drawIBTraCSIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  name: string
): void {
  ctx.save();
  ctx.translate(x, y);

  // Spiral
  ctx.strokeStyle = color;
  ctx.lineWidth = radius * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  ctx.beginPath();
  for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
    const r = (angle / (Math.PI * 6)) * radius;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (angle === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Center
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();

  // Label
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = color;
  ctx.shadowBlur = 4;
  ctx.shadowColor = color;
  ctx.fillText(name.toUpperCase(), x + radius + 8, y + 3);
  ctx.shadowBlur = 0;
}
