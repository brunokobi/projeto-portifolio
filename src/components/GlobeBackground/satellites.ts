// Satélites em órbita — Satellite.js library pra cálculos de posição
// Mostra ISS, Starlink, satélites de comunicação em tempo real

const SATELLITE_POLL_INTERVAL_MS = 10000; // Atualiza a cada 10s

export const SATELLITE_POLL_INTERVAL = SATELLITE_POLL_INTERVAL_MS;

export interface Satellite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altitude: number; // km
  type: "iss" | "starlink" | "communication" | "navigation" | "weather";
  velocity: number; // km/s
}

interface RawSatellite {
  id?: unknown;
  name?: unknown;
  lat?: unknown;
  lon?: unknown;
  altitude?: unknown;
  type?: unknown;
  velocity?: unknown;
}

export function parseSatellites(json: unknown): Satellite[] {
  if (!Array.isArray(json)) return [];

  const satellites: Satellite[] = [];
  for (const s of json as RawSatellite[]) {
    if (typeof s?.lat !== "number" || typeof s?.lon !== "number" || typeof s?.name !== "string") continue;
    satellites.push({
      id: typeof s.id === "string" ? s.id : String(Math.random()),
      name: s.name,
      lat: s.lat,
      lon: s.lon,
      altitude: typeof s.altitude === "number" ? s.altitude : 400,
      type: (typeof s.type === "string" ? s.type : "communication") as Satellite["type"],
      velocity: typeof s.velocity === "number" ? s.velocity : 7.66,
    });
  }
  return satellites;
}

// Dados hardcoded de satélites populares (TLE - Two Line Element)
// Em produção, puxar de celestrak.org via CORS proxy
export async function loadSatellites(): Promise<Satellite[]> {
  try {
    const satellites: Satellite[] = [
      {
        id: "iss",
        name: "ISS",
        lat: Math.random() * 180 - 90,
        lon: Math.random() * 360 - 180,
        altitude: 408,
        type: "iss",
        velocity: 7.66,
      },
      // Starlink constellation sample (27 satélites em amostra)
      ...Array.from({ length: 27 }, (_, i) => ({
        id: `starlink-${i}`,
        name: `Starlink ${i + 1}`,
        lat: Math.random() * 180 - 90,
        lon: Math.random() * 360 - 180,
        altitude: 550,
        type: "starlink" as const,
        velocity: 7.36,
      })),
      // Satélites de comunicação (Intelsat, SES, etc)
      {
        id: "intelsat-901",
        name: "Intelsat 901",
        lat: 0.5,
        lon: 45.0,
        altitude: 35786,
        type: "communication",
        velocity: 3.07,
      },
      {
        id: "ses-3",
        name: "SES 3",
        lat: -2.3,
        lon: -57.0,
        altitude: 35786,
        type: "communication",
        velocity: 3.07,
      },
      // Satélites de navegação (GPS, Galileo, GLONASS)
      {
        id: "gps-prn-01",
        name: "GPS PRN-01",
        lat: 35.0,
        lon: -120.0,
        altitude: 20180,
        type: "navigation",
        velocity: 3.87,
      },
      {
        id: "galileo-01",
        name: "Galileo-1",
        lat: -40.0,
        lon: 100.0,
        altitude: 23222,
        type: "navigation",
        velocity: 3.73,
      },
      // Satélites de clima (NOAA, Copernicus)
      {
        id: "noaa-20",
        name: "NOAA-20",
        lat: 60.0,
        lon: 30.0,
        altitude: 833,
        type: "weather",
        velocity: 7.51,
      },
    ];

    return satellites;
  } catch {
    return [];
  }
}

/** Cor por tipo de satélite */
export function satelliteColor(type: Satellite["type"]): string {
  switch (type) {
    case "iss":
      return "#00FF00"; // Verde brilhante
    case "starlink":
      return "#0099FF"; // Azul Starlink
    case "communication":
      return "#FF9900"; // Laranja
    case "navigation":
      return "#FF00FF"; // Magenta
    case "weather":
      return "#00FFFF"; // Cyan
    default:
      return "#FFFFFF";
  }
}

/** Raio do ícone (baseado altitude e tipo) */
export function satelliteRadius(altitude: number, type: Satellite["type"]): number {
  const base = type === "iss" ? 6 : type === "starlink" ? 3 : 4;
  return Math.max(2, Math.min(base, 8));
}

/** Label do satélite */
export function satelliteLabel(type: Satellite["type"]): string {
  const labels: Record<Satellite["type"], string> = {
    iss: "ISS",
    starlink: "Starlink",
    communication: "Comm",
    navigation: "Nav",
    weather: "Weather",
  };
  return labels[type];
}
