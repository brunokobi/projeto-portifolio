// Furacões - Dados de tempestades tropicais em tempo real
// Fonte: NOAA (National Hurricane Center) - Dados oficiais, sem autenticação

const FETCH_TIMEOUT_MS = 10000;
const HURRICANE_POLL_INTERVAL_MS = 30000; // Atualiza a cada 30s

// URL do feed GeoJSON do NOAA (Atlântico e Pacífico)
const NOAA_ATLANTIC_URL = "https://www.nhc.noaa.gov/gis/forecast/activeAtlantic.geojson";
const NOAA_PACIFIC_URL = "https://www.nhc.noaa.gov/gis/forecast/activePacific.geojson";

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

// Estado interno para simular movimento
const hurricaneState = new Map<string, { lat: number; lon: number; vLat: number; vLon: number }>();

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

function movementToVector(movement: string): { vLat: number; vLon: number } {
  // Converte direção (NW, SE, etc) em vetor de velocidade (graus/update)
  const vectors: Record<string, { vLat: number; vLon: number }> = {
    N: { vLat: 0.15, vLon: 0 },
    NE: { vLat: 0.12, vLon: 0.12 },
    E: { vLat: 0, vLon: 0.15 },
    SE: { vLat: -0.12, vLon: 0.12 },
    S: { vLat: -0.15, vLon: 0 },
    SW: { vLat: -0.12, vLon: -0.12 },
    W: { vLat: 0, vLon: -0.15 },
    NW: { vLat: 0.12, vLon: -0.12 },
  };
  return vectors[movement] || { vLat: 0, vLon: 0 };
}

async function fetchNoaaData(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function extractHurricaneInfo(geojson: any, region: string): Hurricane[] {
  if (!geojson?.features) return [];

  return geojson.features
    .map((feature: any, idx: number) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [];
      if (coords.length < 2) return null;

      const name = props.name || props.STORMNAME || `Storm ${idx}`;
      const windSpeed = props.MAXWIND || props.WIND || 0;
      const pressure = props.MSLP || props.PRESSURE || 1000;

      // Estima categoria pela velocidade do vento (Saffir-Simpson)
      let category = 0;
      if (windSpeed >= 252) category = 5;
      else if (windSpeed >= 209) category = 4;
      else if (windSpeed >= 178) category = 3;
      else if (windSpeed >= 154) category = 2;
      else if (windSpeed >= 119) category = 1;

      return {
        id: `noaa-${region}-${idx}`,
        name,
        lat: coords[1],
        lon: coords[0],
        windSpeed: Math.round(windSpeed * 1.609), // knots → km/h
        pressure: Math.round(pressure),
        category,
        movement: props.MOVEMENT || "N/A",
      };
    })
    .filter((h: Hurricane | null): h is Hurricane => h !== null);
}

export async function loadHurricanes(): Promise<Hurricane[]> {
  try {
    const [atlantic, pacific] = await Promise.all([
      fetchNoaaData(NOAA_ATLANTIC_URL),
      fetchNoaaData(NOAA_PACIFIC_URL),
    ]);

    let hurricanes: Hurricane[] = [];

    if (atlantic) {
      hurricanes.push(...extractHurricaneInfo(atlantic, "atlantic"));
    }
    if (pacific) {
      hurricanes.push(...extractHurricaneInfo(pacific, "pacific"));
    }

    // Se NOAA falhar, volta com dados mock como fallback
    if (hurricanes.length === 0) {
      console.warn("NOAA data unavailable, using fallback mock data");
      return loadMockHurricanes();
    }

    return hurricanes;
  } catch {
    return loadMockHurricanes();
  }
}

function loadMockHurricanes(): Hurricane[] {
  const mocks = [
    {
      id: "mock-1",
      name: "Hurricane Milton",
      baseLat: 20.5,
      baseLon: -45.3,
      windSpeed: 165,
      pressure: 920,
      category: 4,
      movement: "NW",
    },
    {
      id: "mock-2",
      name: "Hurricane Helene",
      baseLat: 28.2,
      baseLon: -35.8,
      windSpeed: 140,
      pressure: 945,
      category: 3,
      movement: "N",
    },
  ];

  return mocks.map((m) => ({
    id: m.id,
    name: m.name,
    lat: m.baseLat,
    lon: m.baseLon,
    windSpeed: m.windSpeed,
    pressure: m.pressure,
    category: m.category,
    movement: m.movement,
  }));
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

/** Raio do ícone do furacão (px) */
export function hurricaneRadius(windSpeed: number): number {
  return 8 + Math.max(0, Math.min(windSpeed / 50, 8)) * 2;
}

/** Label da categoria */
export function hurricaneLabel(category: number): string {
  if (category >= 5) return "Cat 5";
  if (category >= 1) return `Cat ${category}`;
  return "Tropical Storm";
}
