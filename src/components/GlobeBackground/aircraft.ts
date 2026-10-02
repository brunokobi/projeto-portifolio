// Aviões em tempo real — OpenSky Network API (gratuita)
// Mostra voos comerciais ao vivo, rota e altitude

const FETCH_TIMEOUT_MS = 30000;
const AIRCRAFT_POLL_INTERVAL_MS = 30000; // Atualiza a cada 30s

export const AIRCRAFT_POLL_INTERVAL = AIRCRAFT_POLL_INTERVAL_MS;

export interface Aircraft {
  id: string;
  callsign: string;
  lat: number;
  lon: number;
  altitude: number; // metros
  velocity: number; // m/s
  heading: number; // graus (0-360)
  aircraft_type: string;
}

interface RawAircraft {
  id?: unknown;
  callsign?: unknown;
  lat?: unknown;
  lon?: unknown;
  altitude?: unknown;
  velocity?: unknown;
  heading?: unknown;
  aircraft_type?: unknown;
}

export function parseAircraft(json: unknown): Aircraft[] {
  if (!Array.isArray(json)) return [];

  const aircraft: Aircraft[] = [];
  for (const a of json as RawAircraft[]) {
    if (typeof a?.lat !== "number" || typeof a?.lon !== "number" || typeof a?.callsign !== "string") continue;
    if (a.lat < -90 || a.lat > 90 || a.lon < -180 || a.lon > 180) continue;

    aircraft.push({
      id: typeof a.id === "string" ? a.id : String(Math.random()),
      callsign: (a.callsign as string).trim() || "Unknown",
      lat: a.lat,
      lon: a.lon,
      altitude: typeof a.altitude === "number" ? a.altitude : 0,
      velocity: typeof a.velocity === "number" ? a.velocity : 0,
      heading: typeof a.heading === "number" ? a.heading : 0,
      aircraft_type: typeof a.aircraft_type === "string" ? a.aircraft_type : "Aircraft",
    });
  }
  return aircraft;
}

async function fetchOpenSkyAircraft(): Promise<Aircraft[]> {
  try {
    const res = await fetch("https://opensky-network.org/api/states/all?lamin=-90&lamax=90&lomin=-180&lomax=180", {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.states || !Array.isArray(data.states)) return [];

    return data.states
      .map((state: unknown[]) => {
        if (!Array.isArray(state) || state.length < 10) return null;
        return {
          id: state[0],
          callsign: state[1],
          lat: state[6],
          lon: state[5],
          altitude: state[7],
          velocity: state[9],
          heading: state[10],
          aircraft_type: "Commercial",
        };
      })
      .filter((a: Aircraft | null) => a !== null && a.lat && a.lon);
  } catch {
    return [];
  }
}

export async function loadAircraft(): Promise<Aircraft[]> {
  try {
    const aircraft = await fetchOpenSkyAircraft();
    if (aircraft.length > 0) {
      return aircraft.slice(0, 100); // Limita a 100 aviões pra não sobrecarregar
    }
  } catch {
    // continua com dados de exemplo abaixo
  }

  // Dados de exemplo quando API falha (CORS, offline, etc)
  return [
    {
      id: "aa-100",
      callsign: "AA100",
      lat: 40.7128,
      lon: -74.0060,
      altitude: 10000,
      velocity: 900,
      heading: 90,
      aircraft_type: "Boeing 747",
    },
    {
      id: "ua-500",
      callsign: "UA500",
      lat: 35.0,
      lon: -120.0,
      altitude: 8000,
      velocity: 850,
      heading: 180,
      aircraft_type: "Airbus A320",
    },
    {
      id: "dl-200",
      callsign: "DL200",
      lat: 25.0,
      lon: -80.0,
      altitude: 9500,
      velocity: 880,
      heading: 270,
      aircraft_type: "Boeing 737",
    },
    {
      id: "ba-300",
      callsign: "BA300",
      lat: 51.5074,
      lon: -0.1278,
      altitude: 11000,
      velocity: 920,
      heading: 45,
      aircraft_type: "Boeing 777",
    },
    {
      id: "af-400",
      callsign: "AF400",
      lat: 48.8566,
      lon: 2.3522,
      altitude: 10500,
      velocity: 900,
      heading: 135,
      aircraft_type: "Airbus A380",
    },
  ];
}

/** Cor por tipo/altitude */
export function aircraftColor(altitude: number): string {
  if (altitude > 10000) return "#FF0000"; // Vermelho - alto
  if (altitude > 5000) return "#FF6600"; // Laranja - médio
  if (altitude > 1000) return "#FFFF00"; // Amarelo - baixo
  return "#00FF00"; // Verde - decolagem/pouso
}

/** Raio do ícone */
export function aircraftRadius(altitude: number): number {
  return altitude > 0 ? 5 : 3;
}

/** Label */
export function aircraftLabel(callsign: string): string {
  return (callsign || "Aircraft").substring(0, 8);
}
