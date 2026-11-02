// Incêndios (NASA VIIRS via ArcGIS Living Atlas) e conversão PM2.5 → AQI (EPA).

const ARCGIS_LIVEFEEDS_BASE = "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services";
const FETCH_TIMEOUT_MS = 15000;

export interface Wildfire {
  id: string;
  name: string;
  lat: number;
  lon: number;
  confidence: number; // 0-100 (convertido da categoria VIIRS: low/nominal/high)
  date: string;
}

/** Conversão PM2.5 (µg/m³) -> AQI (0-500), breakpoints padrão EPA. */
export function pm25ToAqi(pm25: number): number {
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

