// Cidades importantes — população, GDP, tech hubs. Dados cadastrais
// (coordenadas, população) são fatos reais que não mudam. O AQI é
// enriquecido com dado real (ver enrichCitiesWithAirQuality) — cidade sem
// estação de monitoramento próxima simplesmente fica sem o campo, não
// inventa número.

import { pm25ToAqi } from "./hazards";

export interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
  population: number;
  country: string;
  type: "tech" | "capital" | "megacity";
  aqi?: number;
}

export const TOP_CITIES: City[] = [
  { id: "tokyo", name: "Tokyo", lat: 35.6762, lon: 139.6503, population: 37400000, country: "JP", type: "megacity" },
  { id: "delhi", name: "Delhi", lat: 28.7041, lon: 77.1025, population: 31400000, country: "IN", type: "megacity" },
  { id: "shanghai", name: "Shanghai", lat: 31.2304, lon: 121.4737, population: 28500000, country: "CN", type: "megacity" },
  { id: "sao-paulo", name: "São Paulo", lat: -23.5505, lon: -46.6333, population: 22040000, country: "BR", type: "megacity" },
  { id: "mexico-city", name: "México City", lat: 19.4326, lon: -99.1332, population: 21580000, country: "MX", type: "megacity" },
  { id: "cairo", name: "Cairo", lat: 30.0444, lon: 31.2357, population: 20900000, country: "EG", type: "megacity" },
  { id: "mumbai", name: "Mumbai", lat: 19.0760, lon: 72.8777, population: 20961000, country: "IN", type: "megacity" },
  { id: "beijing", name: "Beijing", lat: 39.9042, lon: 116.4074, population: 21540000, country: "CN", type: "capital" },
  { id: "dhaka", name: "Dhaka", lat: 23.8103, lon: 90.4125, population: 21006000, country: "BD", type: "megacity" },
  { id: "osaka", name: "Osaka", lat: 34.6937, lon: 135.5023, population: 19281000, country: "JP", type: "megacity" },
  // Tech Hubs
  { id: "silicon-valley", name: "Silicon Valley", lat: 37.3382, lon: -121.8863, population: 2100000, country: "US", type: "tech" },
  { id: "san-francisco", name: "San Francisco", lat: 37.7749, lon: -122.4194, population: 873965, country: "US", type: "tech" },
  { id: "seattle", name: "Seattle", lat: 47.6062, lon: -122.3321, population: 753675, country: "US", type: "tech" },
  { id: "shenzhen", name: "Shenzhen", lat: 22.5431, lon: 114.0579, population: 12528900, country: "CN", type: "tech" },
  { id: "hangzhou", name: "Hangzhou", lat: 30.2741, lon: 120.1551, population: 10360000, country: "CN", type: "tech" },
  { id: "london", name: "London", lat: 51.5074, lon: -0.1278, population: 9002488, country: "UK", type: "capital" },
  { id: "paris", name: "Paris", lat: 48.8566, lon: 2.3522, population: 2161000, country: "FR", type: "capital" },
  { id: "berlin", name: "Berlin", lat: 52.5200, lon: 13.4050, population: 3645000, country: "DE", type: "tech" },
  { id: "toronto", name: "Toronto", lat: 43.6532, lon: -79.3832, population: 2930000, country: "CA", type: "tech" },
  { id: "singapore", name: "Singapore", lat: 1.3521, lon: 103.8198, population: 5868000, country: "SG", type: "tech" },
];

export function cityColor(type: City["type"]): string {
  switch (type) {
    case "tech":
      return "#0099FF"; // Azul - tech hubs
    case "capital":
      return "#FF9900"; // Laranja - capitais
    case "megacity":
      return "#FF0000"; // Vermelho - megacidades
  }
}

export function cityRadius(population: number): number {
  return Math.min(12, Math.max(4, Math.log(population) / 3));
}

const AQI_SERVICE_URL =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Air_Quality_PM25_Latest_Results/FeatureServer/0/query";
const AQI_SEARCH_RADIUS_KM = 50;
const FETCH_TIMEOUT_MS = 15000;

async function pm25PertoDe(lat: number, lon: number): Promise<number | null> {
  try {
    const url = new URL(AQI_SERVICE_URL);
    url.searchParams.set("where", "parameter='pm25' AND value IS NOT NULL AND value > 0 AND value < 500");
    url.searchParams.set("geometry", `${lon},${lat}`);
    url.searchParams.set("geometryType", "esriGeometryPoint");
    url.searchParams.set("inSR", "4326");
    url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
    url.searchParams.set("distance", String(AQI_SEARCH_RADIUS_KM));
    url.searchParams.set("units", "esriSRUnit_Kilometer");
    url.searchParams.set("outFields", "value");
    url.searchParams.set("orderByFields", "lastUpdated DESC");
    url.searchParams.set("resultRecordCount", "1");
    url.searchParams.set("f", "json");

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const data = await res.json();
    const valor = data?.features?.[0]?.attributes?.value;
    return typeof valor === "number" ? valor : null;
  } catch {
    return null;
  }
}

/**
 * Busca a estação de qualidade do ar real mais próxima de cada cidade (raio
 * de 50km, mesma fonte de hazards.ts). Cidade sem estação dentro do raio
 * fica sem `aqi` — não inventa valor.
 */
export async function enrichCitiesWithAirQuality(cities: City[]): Promise<City[]> {
  const resultados = await Promise.all(
    cities.map(async (c) => {
      const pm25 = await pm25PertoDe(c.lat, c.lon);
      return pm25 === null ? c : { ...c, aqi: pm25ToAqi(pm25) };
    })
  );
  return resultados;
}
