// AQI real da estação de monitoramento mais próxima da cidade (ArcGIS Living
// Atlas, PM2.5). Cidade sem estação dentro do raio fica sem AQI: não inventa valor.

import { pm25ToAqi } from "./hazards";

const AQI_SERVICE_URL =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Air_Quality_PM25_Latest_Results/FeatureServer/0/query";
const AQI_SEARCH_RADIUS_KM = 50;
const FETCH_TIMEOUT_MS = 15000;

export async function fetchCityAqi(lat: number, lon: number): Promise<number | null> {
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
    return typeof valor === "number" ? pm25ToAqi(valor) : null;
  } catch {
    return null;
  }
}
