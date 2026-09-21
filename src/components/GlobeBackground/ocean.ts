// Correntes marítimas reais sobre o globo — Open-Meteo Marine API
// (https://open-meteo.com/en/docs/marine-weather-api), sem chave, CORS
// liberado. Fonte original dos dados: modelo SMOC (Mercator Ocean —
// mesma família do Copernicus Marine/CMEMS), não é o mesmo produto exato
// do CMEMS "Global Ocean Physics Analysis and Forecast" (esse exige conta
// própria e não tem endpoint JSON público), mas é corrente marítima real.
//
// A API é por ponto, não por grade — então montamos nossa própria grade
// (10° de espaçamento) fazendo uma única requisição com todas as
// coordenadas separadas por vírgula. Reaproveita a matemática pura de
// vento (grade + interpolação bilinear são genéricas, não têm nada
// específico de vento) — só o carregamento, a cor e a física da partícula
// são próprios daqui, porque a escala de velocidade e o tempo de vida são
// bem diferentes (corrente marítima é ~10x mais lenta que vento).

import { sampleWind, type WindGrid } from "./wind";

const MARINE_API_URL = "https://marine-api.open-meteo.com/v1/marine";
const FETCH_TIMEOUT_MS = 15000;

const LON_STEP = 10;
const LAT_STEP = 10;
const LAT_MAX = 80; // evita a grade nos polos, onde o dado é dominado por gelo marinho
const OCEAN_NX = 36; // 360 / LON_STEP
const OCEAN_NY = 17; // (2 * LAT_MAX) / LAT_STEP + 1

/** Coordenadas da grade, na ordem em que a API precisa devolver (linha a linha). */
export function buildOceanCoords(): Array<{ lat: number; lon: number }> {
  const coords: Array<{ lat: number; lon: number }> = [];
  for (let yi = 0; yi < OCEAN_NY; yi++) {
    const lat = LAT_MAX - yi * LAT_STEP;
    for (let xi = 0; xi < OCEAN_NX; xi++) {
      const lon = -180 + xi * LON_STEP;
      coords.push({ lat, lon });
    }
  }
  return coords;
}

interface MarinePoint {
  hourly?: {
    ocean_current_velocity?: Array<number | null>;
    ocean_current_direction?: Array<number | null>;
  };
}

/**
 * Converte a resposta da API (um objeto por coordenada, na mesma ordem da
 * requisição) numa grade no mesmo formato de WindGrid. Pontos em terra (ou
 * sem dado) ficam com corrente zero — não com um valor inventado.
 */
export function parseOceanResponse(json: unknown, coordCount: number): WindGrid | null {
  if (!Array.isArray(json) || json.length !== coordCount) return null;

  const u = new Float32Array(coordCount);
  const v = new Float32Array(coordCount);

  for (let i = 0; i < coordCount; i++) {
    const point = json[i] as MarinePoint;
    const speedKmh = point?.hourly?.ocean_current_velocity?.[0];
    const dirDeg = point?.hourly?.ocean_current_direction?.[0];
    if (speedKmh == null || dirDeg == null) continue; // terra ou sem dado — fica 0,0

    const speedMs = speedKmh / 3.6;
    const dirRad = (dirDeg * Math.PI) / 180;
    // ocean_current_direction é "pra onde a corrente vai" (0°=norte, 90°=leste)
    // — convenção oposta à de vento (que é "de onde vem"), por isso sem negar.
    u[i] = speedMs * Math.sin(dirRad);
    v[i] = speedMs * Math.cos(dirRad);
  }

  return { nx: OCEAN_NX, ny: OCEAN_NY, lo1: -180, la1: LAT_MAX, dx: LON_STEP, dy: LAT_STEP, u, v };
}

export async function loadOceanGrid(): Promise<WindGrid | null> {
  try {
    const coords = buildOceanCoords();
    const lat = coords.map((c) => c.lat).join(",");
    const lon = coords.map((c) => c.lon).join(",");
    const url = `${MARINE_API_URL}?latitude=${lat}&longitude=${lon}&hourly=ocean_current_velocity,ocean_current_direction&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    return parseOceanResponse(await res.json(), coords.length);
  } catch {
    return null;
  }
}

// Escala de cor por velocidade (m/s) — bem mais sensível que a do vento,
// porque corrente marítima raramente passa de ~1.5m/s (vento passa de
// 20m/s fácil). Usar a escala do vento aqui faria tudo parecer "calmo".
const OCEAN_SPEED_COLOR_STOPS: Array<{ speed: number; rgb: [number, number, number] }> = [
  { speed: 0, rgb: [20, 70, 140] },
  { speed: 0.3, rgb: [40, 150, 170] },
  { speed: 0.6, rgb: [90, 200, 120] },
  { speed: 1.0, rgb: [220, 200, 50] },
  { speed: 1.5, rgb: [230, 90, 40] },
];

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function oceanSpeedToColor(speedMs: number): string {
  const s = Math.max(0, speedMs);
  let i = 0;
  while (i < OCEAN_SPEED_COLOR_STOPS.length - 2 && s > OCEAN_SPEED_COLOR_STOPS[i + 1].speed) i++;
  const a = OCEAN_SPEED_COLOR_STOPS[i];
  const b = OCEAN_SPEED_COLOR_STOPS[i + 1];
  const span = b.speed - a.speed;
  const t = span > 0 ? Math.min(1, Math.max(0, (s - a.speed) / span)) : 0;
  return `rgb(${lerpChannel(a.rgb[0], b.rgb[0], t)},${lerpChannel(a.rgb[1], b.rgb[1], t)},${lerpChannel(a.rgb[2], b.rgb[2], t)})`;
}

export interface OceanParticle {
  lat: number;
  lon: number;
  age: number;
}

const MAX_AGE_FRAMES = 300; // correntes são mais estáveis que vento — partículas vivem mais
const MAX_LAT = LAT_MAX;
// Corrente marítima é ~10x mais lenta que vento (m/s) — passo de tempo
// maior pra compensar e o deslocamento por frame continuar visível.
const TIME_STEP_SECONDS = 30000;
const EARTH_RADIUS_M = 6371000;

export function createRandomOceanParticle(): OceanParticle {
  return {
    lat: Math.random() * MAX_LAT * 2 - MAX_LAT,
    lon: Math.random() * 360,
    age: Math.floor(Math.random() * MAX_AGE_FRAMES),
  };
}

export function advanceOceanParticle(p: OceanParticle, grid: WindGrid): OceanParticle {
  const { u, v } = sampleWind(grid, p.lat, p.lon);
  const latRad = (p.lat * Math.PI) / 180;
  const cosLat = Math.max(Math.cos(latRad), 0.15);
  const dLon = ((u * TIME_STEP_SECONDS) / (EARTH_RADIUS_M * cosLat)) * (180 / Math.PI);
  const dLat = ((v * TIME_STEP_SECONDS) / EARTH_RADIUS_M) * (180 / Math.PI);
  const lat = p.lat + dLat;
  const lon = (((p.lon + dLon) % 360) + 360) % 360;
  const age = p.age + 1;

  if (age >= MAX_AGE_FRAMES || lat > MAX_LAT || lat < -MAX_LAT) {
    return createRandomOceanParticle();
  }
  return { lat, lon, age };
}
