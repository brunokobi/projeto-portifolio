// Terremotos reais — USGS Earthquake Hazards Program, feed público em
// GeoJSON, sem chave, CORS liberado.
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson

const QUAKES_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson";
const FETCH_TIMEOUT_MS = 10000;

export interface Quake {
  lat: number;
  lon: number;
  mag: number;
  place: string;
  time: number; // epoch ms
}

interface GeoJsonFeature {
  properties?: { mag?: number | null; place?: string | null; time?: number | null };
  geometry?: { coordinates?: [number, number, number] };
}

export function parseQuakes(json: unknown): Quake[] {
  const features = (json as { features?: unknown })?.features;
  if (!Array.isArray(features)) return [];

  const quakes: Quake[] = [];
  for (const f of features as GeoJsonFeature[]) {
    const mag = f?.properties?.mag;
    const coords = f?.geometry?.coordinates;
    if (mag == null || !Array.isArray(coords) || coords.length < 2) continue;
    quakes.push({
      lat: coords[1],
      lon: coords[0],
      mag,
      place: f.properties?.place ?? "",
      time: f.properties?.time ?? 0,
    });
  }
  return quakes;
}

export async function loadQuakes(): Promise<Quake[]> {
  try {
    const res = await fetch(QUAKES_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return [];
    return parseQuakes(await res.json());
  } catch {
    return [];
  }
}

/** Cor pela magnitude — amarelo (moderado) até vermelho (forte). */
export function quakeColor(mag: number): string {
  if (mag >= 6) return "#ff2d2d";
  if (mag >= 5.5) return "#ff6a00";
  if (mag >= 5) return "#ffa300";
  return "#ffdc00";
}

/** Raio do anel (px) pela magnitude — maior sismo, anel maior. */
export function quakeRadius(mag: number): number {
  return 5 + Math.max(0, mag - 4.5) * 6;
}
