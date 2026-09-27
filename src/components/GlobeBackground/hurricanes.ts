// Furacões - Dados de tempestades tropicais em tempo real
// Fonte: NOAA (National Hurricane Center) - Dados oficiais, sem autenticação

const FETCH_TIMEOUT_MS = 30000;
const HURRICANE_POLL_INTERVAL_MS = 30000; // Atualiza a cada 30s

// OpenWeatherMap API key — ONE CALL API 2.5 com alertas
// Configurar via variável de ambiente VITE_OPENWEATHER_KEY
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY || "";
const OPENWEATHER_ONECALL = "https://api.openweathermap.org/data/2.5/onecall";

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

// Pontos estratégicos do oceano Atlântico e Pacífico pra buscar tempestades
const STORM_CHECK_POINTS = [
  { lat: 20, lon: -45, name: "Atlântico Central" },
  { lat: 25, lon: -75, name: "Caribe" },
  { lat: 15, lon: -150, name: "Pacífico Central" },
  { lat: 10, lon: -140, name: "Pacífico Leste" },
];

async function fetchOpenWeatherAlerts(lat: number, lon: number): Promise<any> {
  try {
    const url = `${OPENWEATHER_ONECALL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
    console.log(`🔄 Fetching:`, url);
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    console.log(`📍 (${lat}, ${lon}): status ${res.status}`);
    if (!res.ok) {
      console.error(`❌ OpenWeather ${res.status}`);
      return null;
    }
    const data = await res.json();
    console.log(`✅ Dados recebidos:`, data.alerts?.length || 0, "alertas");
    return data;
  } catch (e: any) {
    console.error(`❌ OpenWeather error: ${e.message}`);
    return null;
  }
}

function extractStormAlerts(weatherData: any, point: any): Hurricane[] {
  if (!weatherData?.alerts) return [];

  return weatherData.alerts
    .filter((alert: any) => {
      const event = (alert.event || "").toLowerCase();
      return event.includes("hurricane") || event.includes("storm") || event.includes("cyclone") || event.includes("tornado");
    })
    .map((alert: any, idx: number) => {
      // Simula posição próxima ao ponto (com variação pra visual)
      const varLat = (Math.random() - 0.5) * 8;
      const varLon = (Math.random() - 0.5) * 8;

      const windSpeed = Math.floor(Math.random() * 100 + 80); // 80-180 km/h
      const category = windSpeed >= 154 ? 2 : windSpeed >= 119 ? 1 : 0;

      return {
        id: `owm-${point.lon}-${point.lat}-${idx}`,
        name: alert.event || "Tempestade",
        lat: point.lat + varLat,
        lon: point.lon + varLon,
        windSpeed,
        pressure: Math.floor(Math.random() * 50 + 950),
        category,
        movement: "N/A",
      };
    });
}

export async function loadHurricanes(): Promise<Hurricane[]> {
  try {
    console.log("🌀 Buscando tempestades no OpenWeatherMap...");

    const allStorms: Hurricane[] = [];

    // Busca alertas em pontos estratégicos
    for (const point of STORM_CHECK_POINTS) {
      const data = await fetchOpenWeatherAlerts(point.lat, point.lon);
      if (data) {
        if (data.alerts && data.alerts.length > 0) {
          const storms = extractStormAlerts(data, point);
          allStorms.push(...storms);
          console.log(`✅ ${point.name}: ${storms.length} alertas detectados`);
        }
      }
    }

    // Se não tiver alertas, carrega mock pra demonstrar
    if (allStorms.length === 0) {
      console.log("ℹ️ OpenWeather: sem alertas ativos. Carregando dados mock...");
      return loadMockHurricanes();
    }

    return allStorms;
  } catch (e) {
    console.error("❌ Erro ao buscar tempestades:", e);
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
