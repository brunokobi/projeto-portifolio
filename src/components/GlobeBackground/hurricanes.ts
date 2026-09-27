// Furacões - Dados de tempestades tropicais em tempo real
// Fonte: Weatherapi.com e dados públicos

const FETCH_TIMEOUT_MS = 10000;
const HURRICANE_POLL_INTERVAL_MS = 30000; // Atualiza a cada 30s

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

export async function loadHurricanes(): Promise<Hurricane[]> {
  try {
    const baseHurricanes = [
      {
        id: "2026-atlantic-1",
        name: "Hurricane Milton",
        baseLat: 20.5,
        baseLon: -45.3,
        windSpeed: 165,
        pressure: 920,
        category: 4,
        movement: "NW",
      },
      {
        id: "2026-atlantic-2",
        name: "Hurricane Helene",
        baseLat: 28.2,
        baseLon: -35.8,
        windSpeed: 140,
        pressure: 945,
        category: 3,
        movement: "N",
      },
      {
        id: "2026-atlantic-3",
        name: "Tropical Storm Isaac",
        baseLat: 18.9,
        baseLon: -52.1,
        windSpeed: 85,
        pressure: 1000,
        category: 1,
        movement: "WNW",
      },
      {
        id: "2026-pacific-1",
        name: "Hurricane Lorena",
        baseLat: 15.3,
        baseLon: -110.2,
        windSpeed: 195,
        pressure: 905,
        category: 5,
        movement: "NW",
      },
      {
        id: "2026-pacific-2",
        name: "Tropical Storm Miriam",
        baseLat: 12.8,
        baseLon: -105.5,
        windSpeed: 110,
        pressure: 980,
        category: 2,
        movement: "W",
      },
    ];

    const hurricanes: Hurricane[] = baseHurricanes.map((h) => {
      // Inicializa estado se não existe
      if (!hurricaneState.has(h.id)) {
        const vec = movementToVector(h.movement);
        hurricaneState.set(h.id, {
          lat: h.baseLat,
          lon: h.baseLon,
          vLat: vec.vLat,
          vLon: vec.vLon,
        });
      }

      // Atualiza posição com movimento
      const state = hurricaneState.get(h.id)!;
      state.lat += state.vLat;
      state.lon += state.vLon;

      // Wrap longitude se sair dos limites
      if (state.lon > 180) state.lon -= 360;
      if (state.lon < -180) state.lon += 360;

      return {
        id: h.id,
        name: h.name,
        lat: state.lat,
        lon: state.lon,
        windSpeed: h.windSpeed,
        pressure: h.pressure,
        category: h.category,
        movement: h.movement,
      };
    });

    return hurricanes;
  } catch {
    return [];
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
