// Perigos/Eventos — Qualidade do Ar (OpenAQ via ArcGIS Living Atlas) e
// Incêndios (NASA VIIRS via ArcGIS Living Atlas), ambos dados reais. Raios
// continua simulado — não achamos fonte pública global gratuita de raios em
// tempo real (ver loadLightning).

const ARCGIS_LIVEFEEDS_BASE = "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services";
const FETCH_TIMEOUT_MS = 15000;

export interface AirQuality {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number; // 0-500 (0-50 good, 51-100 moderate, etc) — convertido de PM2.5 (EPA)
  pm25: number;
}

export interface Wildfire {
  id: string;
  name: string;
  lat: number;
  lon: number;
  confidence: number; // 0-100 (convertido da categoria VIIRS: low/nominal/high)
  date: string;
}

export interface Lightning {
  id: string;
  lat: number;
  lon: number;
  intensity: number; // relativo
  timestamp: number;
}

// Simulação de raios (padrões de atividade) — mantido simulado: não há API
// pública gratuita de raios em tempo real com cobertura global (ex.:
// Blitzortung é comunitário, sem endpoint público estável).
export const SAMPLE_LIGHTNING: Lightning[] = Array.from({ length: 15 }, (_, i) => ({
  id: `lightning-${i}`,
  lat: Math.random() * 180 - 90,
  lon: Math.random() * 360 - 180,
  intensity: Math.random() * 100,
  timestamp: Date.now() - Math.random() * 60000, // últimos 60s
}));

/** Conversão PM2.5 (µg/m³) -> AQI (0-500), breakpoints padrão EPA. */
function pm25ToAqi(pm25: number): number {
  const faixas: [number, number, number, number][] = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];
  for (const [cLo, cHi, aLo, aHi] of faixas) {
    if (pm25 >= cLo && pm25 <= cHi) {
      return Math.round(((aHi - aLo) / (cHi - cLo)) * (pm25 - cLo) + aLo);
    }
  }
  return pm25 > 500.4 ? 500 : 0;
}

interface ArcgisQueryResponse<T> {
  features?: { attributes: T; geometry?: { x: number; y: number } }[];
  error?: unknown;
}

async function queryArcgisLiveFeed<T>(
  service: string,
  layerId: number,
  params: Record<string, string>
): Promise<{ attributes: T; geometry?: { x: number; y: number } }[]> {
  const url = new URL(`${ARCGIS_LIVEFEEDS_BASE}/${service}/FeatureServer/${layerId}/query`);
  url.searchParams.set("f", "json");
  url.searchParams.set("outSR", "4326");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) return [];
  const data: ArcgisQueryResponse<T> = await res.json();
  if (data.error || !data.features) return [];
  return data.features;
}

interface AirQualityAttrs {
  city?: string | null;
  country_name?: string | null;
  value?: number | null;
}

export async function loadAirQuality(): Promise<AirQuality[]> {
  try {
    const agora = new Date();
    const corte = new Date(agora.getTime() - 48 * 60 * 60 * 1000); // só leituras das últimas 48h
    const cortIso = corte.toISOString().replace("T", " ").slice(0, 19);

    const features = await queryArcgisLiveFeed<AirQualityAttrs>(
      "Air_Quality_PM25_Latest_Results",
      0,
      {
        where: `parameter='pm25' AND value IS NOT NULL AND value > 0 AND value < 500 AND lastUpdated >= TIMESTAMP '${cortIso}'`,
        outFields: "city,country_name,value",
        orderByFields: "value DESC",
        resultRecordCount: "60",
      }
    );

    return features
      .filter((f) => f.geometry)
      .map((f, i) => {
        const nomeCru = (f.attributes.city || f.attributes.country_name || "Estação").replace(/^"|"$/g, "");
        const pm25 = f.attributes.value ?? 0;
        return {
          id: `aqi-${i}-${f.geometry!.x.toFixed(2)}-${f.geometry!.y.toFixed(2)}`,
          name: nomeCru,
          lat: f.geometry!.y,
          lon: f.geometry!.x,
          pm25,
          aqi: pm25ToAqi(pm25),
        };
      });
  } catch {
    return [];
  }
}

interface WildfireAttrs {
  latitude?: number | null;
  longitude?: number | null;
  confidence?: string | null;
  acq_date?: number | null;
  frp?: number | null;
  satellite?: string | null;
}

function confidenceViirsParaNumero(c: string | null | undefined): number {
  if (c === "high") return 95;
  if (c === "nominal") return 75;
  return 40; // "low"
}

export async function loadWildfires(): Promise<Wildfire[]> {
  try {
    const features = await queryArcgisLiveFeed<WildfireAttrs>(
      "Satellite_VIIRS_Thermal_Hotspots_and_Fire_Activity",
      0,
      {
        // high confidence + FRP (potência radiativa do fogo) mínima: filtra
        // ruído/detecções fracas — sem isso vêm 100k+ pontos nas últimas 24h
        // globalmente, inviável de desenhar e sem sinal visual útil.
        where: "hours_old<=6 AND confidence='high' AND frp>=10",
        outFields: "latitude,longitude,confidence,acq_date,frp,satellite",
        resultRecordCount: "500",
      }
    );

    return features
      .filter((f) => typeof f.attributes.latitude === "number" && typeof f.attributes.longitude === "number")
      .map((f, i) => ({
        id: `fire-${i}-${f.attributes.latitude}-${f.attributes.longitude}`,
        name: `Foco de incêndio (${f.attributes.satellite ?? "VIIRS"}, FRP ${f.attributes.frp?.toFixed(1) ?? "?"})`,
        lat: f.attributes.latitude!,
        lon: f.attributes.longitude!,
        confidence: confidenceViirsParaNumero(f.attributes.confidence),
        date: f.attributes.acq_date ? new Date(f.attributes.acq_date).toISOString().slice(0, 10) : "",
      }));
  } catch {
    return [];
  }
}

export async function loadLightning(): Promise<Lightning[]> {
  return SAMPLE_LIGHTNING;
}

export function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#00FF00"; // Good - Green
  if (aqi <= 100) return "#FFFF00"; // Moderate - Yellow
  if (aqi <= 150) return "#FF9900"; // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return "#FF3333"; // Unhealthy - Red
  if (aqi <= 300) return "#990099"; // Very Unhealthy - Purple
  return "#663300"; // Hazardous - Brown
}

export function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "USG";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Bad";
  return "Hazardous";
}

export function wildfireColor(confidence: number): string {
  if (confidence > 90) return "#FF0000"; // Bright red - high confidence
  if (confidence > 75) return "#FF6600"; // Orange - medium
  return "#FFCC00"; // Yellow - low
}

export function lightningColor(): string {
  return "#FFFF00"; // Yellow - bright flash
}
