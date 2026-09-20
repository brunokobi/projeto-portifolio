// Partículas de vento real sobre o globo — dados de vento em grade (GFS,
// formato nullschool) publicados por github.com/Deasus/firestorm-wind-data
// (CC/domínio público, atualizado a cada poucas horas). Mesma ideia visual
// do earth.nullschool.net, mas desenhada no canvas que já existe neste
// componente (o mesmo que desenha os pins das cidades), com dados de verdade
// em vez de embutir o app de outra pessoa.
//
// Toda a lógica aqui é pura (sem DOM/canvas/ArcGIS) de propósito — dá pra
// testar a matemática (interpolação bilinear, wrap de longitude, avanço de
// partícula) isolada, sem precisar renderizar nada.

const WIND_GRID_URL =
  "https://raw.githubusercontent.com/Deasus/firestorm-wind-data/main/data/current-wind-surface.json";
const FETCH_TIMEOUT_MS = 8000;

export interface WindGrid {
  nx: number;
  ny: number;
  lo1: number;
  la1: number;
  dx: number;
  dy: number;
  u: Float32Array;
  v: Float32Array;
}

interface NullschoolLayer {
  header: { nx: number; ny: number; lo1: number; la1: number; dx: number; dy: number };
  data: number[];
}

export function parseWindGrid(json: unknown): WindGrid | null {
  if (!Array.isArray(json) || json.length < 2) return null;
  const [uLayer, vLayer] = json as [NullschoolLayer, NullschoolLayer];
  const h = uLayer?.header;
  if (!h || !Array.isArray(uLayer.data) || !Array.isArray(vLayer?.data)) return null;
  if (uLayer.data.length !== h.nx * h.ny || vLayer.data.length !== h.nx * h.ny) return null;
  return {
    nx: h.nx,
    ny: h.ny,
    lo1: h.lo1,
    la1: h.la1,
    dx: h.dx,
    dy: h.dy,
    u: Float32Array.from(uLayer.data),
    v: Float32Array.from(vLayer.data),
  };
}

export async function loadWindGrid(): Promise<WindGrid | null> {
  try {
    const res = await fetch(WIND_GRID_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    return parseWindGrid(await res.json());
  } catch {
    return null;
  }
}

// Índice de um ponto da grade, com wrap na longitude (o mundo é redondo:
// coluna nx é a mesma que a coluna 0) e clamp na latitude (não existe linha
// "acima" do polo norte nem "abaixo" do polo sul).
function gridIndex(grid: WindGrid, xi: number, yi: number): number {
  const x = ((xi % grid.nx) + grid.nx) % grid.nx;
  const y = Math.min(Math.max(yi, 0), grid.ny - 1);
  return y * grid.nx + x;
}

/** Interpolação bilinear do vento (u, v em m/s) em qualquer lat/lon. */
export function sampleWind(grid: WindGrid, lat: number, lon: number): { u: number; v: number } {
  const lonNorm = ((lon % 360) + 360) % 360;
  const x = (lonNorm - grid.lo1) / grid.dx;
  const y = (grid.la1 - lat) / grid.dy;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xt = x - x0;
  const yt = y - y0;

  const i00 = gridIndex(grid, x0, y0);
  const i10 = gridIndex(grid, x0 + 1, y0);
  const i01 = gridIndex(grid, x0, y0 + 1);
  const i11 = gridIndex(grid, x0 + 1, y0 + 1);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const u = lerp(lerp(grid.u[i00], grid.u[i10], xt), lerp(grid.u[i01], grid.u[i11], xt), yt);
  const v = lerp(lerp(grid.v[i00], grid.v[i10], xt), lerp(grid.v[i01], grid.v[i11], xt), yt);
  return { u, v };
}

export interface WindParticle {
  lat: number;
  lon: number;
  age: number;
}

const MAX_AGE_FRAMES = 150;
const MAX_LAT = 75; // evita distorção/instabilidade perto dos polos
// Vento real (m/s) move uma partícula um trecho imperceptível por frame —
// esse fator simula "minutos de deriva" por frame só pro efeito visual, não
// é físico. Ajustável: maior = partículas mais rápidas.
const TIME_STEP_SECONDS = 3000;
const EARTH_RADIUS_M = 6371000;

export function createRandomParticle(): WindParticle {
  return {
    lat: Math.random() * MAX_LAT * 2 - MAX_LAT,
    lon: Math.random() * 360,
    age: Math.floor(Math.random() * MAX_AGE_FRAMES), // idades variadas — evita nascerem todas juntas
  };
}

/** Desloca um lat/lon por (u,v) m/s durante `seconds` segundos, ao longo da esfera. */
function displace(
  lat: number,
  lon: number,
  u: number,
  v: number,
  seconds: number
): { lat: number; lon: number } {
  const latRad = (lat * Math.PI) / 180;
  const cosLat = Math.max(Math.cos(latRad), 0.15); // evita explosão de dLon perto do polo
  const dLon = ((u * seconds) / (EARTH_RADIUS_M * cosLat)) * (180 / Math.PI);
  const dLat = ((v * seconds) / EARTH_RADIUS_M) * (180 / Math.PI);
  return {
    lat: lat + dLat,
    lon: (((lon + dLon) % 360) + 360) % 360,
  };
}

/**
 * Só pra desenho: ponta de uma "farpa" curta na direção do vento a partir de
 * lat/lon, sem afetar o ciclo de vida de nenhuma partícula (não é
 * advanceParticle — não envelhece, não respawna).
 */
export function windDashEnd(
  grid: WindGrid,
  lat: number,
  lon: number,
  seconds: number
): { lat: number; lon: number } {
  const { u, v } = sampleWind(grid, lat, lon);
  return displace(lat, lon, u, v, seconds);
}

/** Avança uma partícula um frame; nasce de novo se "morrer" (idade ou polo). */
export function advanceParticle(p: WindParticle, grid: WindGrid): WindParticle {
  const { u, v } = sampleWind(grid, p.lat, p.lon);
  const { lat, lon } = displace(p.lat, p.lon, u, v, TIME_STEP_SECONDS);
  const age = p.age + 1;

  if (age >= MAX_AGE_FRAMES || lat > MAX_LAT || lat < -MAX_LAT) {
    return createRandomParticle();
  }
  return { lat, lon, age };
}
