// Alertas de emergência (CAP — Common Alerting Protocol) — agregação global
// de avisos oficiais de agências de múltiplos países (clima severo, enchente,
// incêndio, etc.), via ArcGIS Living Atlas "CAP Alerts Feed"
// (esri_livefeeds2). A geometria original é polígono (área afetada); usamos
// o centroide (returnCentroid) pra plotar como ponto, igual aos outros
// perigos do globo.

const CAP_ALERTS_URL =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/CAP_Alerts_Feed/FeatureServer/0/query";
const FETCH_TIMEOUT_MS = 20000;
export const CAP_ALERTS_POLL_INTERVAL = 5 * 60 * 1000; // feed agregado, atualiza a cada poucos minutos

let cachedAlerts: CapAlert[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000;

export interface CapAlert {
  id: string;
  event: string;
  severity: string; // Extreme | Severe | Moderate | Minor | Unknown
  urgency: string;
  areaDesc: string;
  senderName: string;
  countryCode: string;
  lat: number;
  lon: number;
}

interface CapAlertAttrs {
  headline?: string | null;
  event?: string | null;
  severity?: string | null;
  urgency?: string | null;
  areaDesc?: string | null;
  senderName?: string | null;
  countryCode?: string | null;
}

export async function loadCapAlerts(): Promise<CapAlert[]> {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedAlerts;
  }

  try {
    const corte = new Date(now - 24 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19);
    const url = new URL(CAP_ALERTS_URL);
    url.searchParams.set(
      "where",
      // Só alertas reais (não teste/rascunho), graves/extremos e das últimas
      // 24h — sem esse recorte o feed global passa de 2 mil registros/dia
      // (a maioria Moderate/Minor, baixo sinal pra um globo).
      `status='Actual' AND msgType='Alert' AND severity IN ('Severe','Extreme') AND sent >= TIMESTAMP '${corte}'`
    );
    url.searchParams.set("outFields", "headline,event,severity,urgency,areaDesc,senderName,countryCode");
    url.searchParams.set("returnCentroid", "true");
    url.searchParams.set("returnGeometry", "false");
    url.searchParams.set("outSR", "4326");
    url.searchParams.set("resultRecordCount", "300");
    url.searchParams.set("f", "json");

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return cachedAlerts;
    const data = await res.json();
    if (data.error || !Array.isArray(data.features)) return cachedAlerts;

    const alerts: CapAlert[] = [];
    for (const f of data.features as { attributes: CapAlertAttrs; centroid?: { x: number; y: number } }[]) {
      if (!f.centroid) continue;
      const a = f.attributes;
      alerts.push({
        id: `cap-${alerts.length}-${f.centroid.x.toFixed(2)}-${f.centroid.y.toFixed(2)}`,
        event: a.event || a.headline || "Alerta",
        severity: a.severity || "Unknown",
        urgency: a.urgency || "",
        areaDesc: a.areaDesc || "",
        senderName: a.senderName || "",
        countryCode: (a.countryCode || "").toUpperCase(),
        lat: f.centroid.y,
        lon: f.centroid.x,
      });
    }

    cachedAlerts = alerts;
    cacheTimestamp = now;
    return alerts;
  } catch {
    return cachedAlerts;
  }
}

export function capAlertColor(severity: string): string {
  if (severity === "Extreme") return "#FF0000";
  if (severity === "Severe") return "#FF9900";
  if (severity === "Moderate") return "#FFFF00";
  return "#CCCCCC";
}
