// Vento real sobre o globo — dados em grade (GFS, formato nullschool)
// publicados por github.com/Deasus/firestorm-wind-data (CC/domínio público,
// atualizado a cada poucas horas). Efeito visual: correntes contínuas
// coloridas por velocidade, no estilo earth.nullschool.net — rastro que
// desbota (desenhado no componente, ver index.tsx) + mapa de calor de fundo
// (textura gerada aqui e aplicada na esfera do globo).
//
// Toda a lógica aqui é pura (sem DOM/canvas/ArcGIS) de propósito — dá pra
// testar a matemática isolada, sem precisar renderizar nada.

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

/** Magnitude do vento (m/s) a partir das componentes u/v. */
export function windSpeed(u: number, v: number): number {
  return Math.sqrt(u * u + v * v);
}

// Escala de cor por velocidade (m/s), mesmo espírito da escala clássica do
// earth.nullschool: calmo = azul, moderado = verde/amarelo, forte = laranja/
// vermelho. Interpola linearmente entre os pontos de parada.
const SPEED_COLOR_STOPS: Array<{ speed: number; rgb: [number, number, number] }> = [
  { speed: 0, rgb: [36, 104, 180] },
  { speed: 5, rgb: [60, 179, 150] },
  { speed: 10, rgb: [140, 209, 90] },
  { speed: 15, rgb: [230, 210, 60] },
  { speed: 20, rgb: [235, 140, 40] },
  { speed: 25, rgb: [215, 40, 40] },
];

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Cor "rgb(r,g,b)" pra uma velocidade de vento em m/s. */
export function speedToColor(speedMs: number): string {
  const s = Math.max(0, speedMs);
  let i = 0;
  while (i < SPEED_COLOR_STOPS.length - 2 && s > SPEED_COLOR_STOPS[i + 1].speed) i++;
  const a = SPEED_COLOR_STOPS[i];
  const b = SPEED_COLOR_STOPS[i + 1];
  const span = b.speed - a.speed;
  const t = span > 0 ? Math.min(1, Math.max(0, (s - a.speed) / span)) : 0;
  const r = lerpChannel(a.rgb[0], b.rgb[0], t);
  const g = lerpChannel(a.rgb[1], b.rgb[1], t);
  const bl = lerpChannel(a.rgb[2], b.rgb[2], t);
  return `rgb(${r},${g},${bl})`;
}

/**
 * Buffer RGBA (equiretangular, longitude 0–360 da esquerda pra direita,
 * latitude 90..-90 de cima pra baixo) colorido pela velocidade do vento —
 * a "camada de mapa de calor" aplicada como textura na esfera do globo.
 * Áreas calmas ficam quase transparentes; vento forte fica bem visível.
 */
export function buildHeatmapPixels(grid: WindGrid, width: number, height: number): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  const MAX_SPEED_FOR_ALPHA = 20;
  const BASE_ALPHA = 40;
  const MAX_ALPHA = 190;

  for (let y = 0; y < height; y++) {
    const lat = 90 - ((y + 0.5) / height) * 180;
    for (let x = 0; x < width; x++) {
      const lon = ((x + 0.5) / width) * 360;
      const { u, v } = sampleWind(grid, lat, lon);
      const speed = windSpeed(u, v);
      const [r, g, b] = speedToColor(speed)
        .replace(/rgb\(|\)/g, "")
        .split(",")
        .map(Number);
      const alphaT = Math.min(1, speed / MAX_SPEED_FOR_ALPHA);
      const alpha = BASE_ALPHA + alphaT * (MAX_ALPHA - BASE_ALPHA);

      const idx = (y * width + x) * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = alpha;
    }
  }
  return pixels;
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

/** Avança uma partícula um frame; nasce de novo se "morrer" (idade ou polo). */
export function advanceParticle(p: WindParticle, grid: WindGrid): WindParticle {
  const { u, v } = sampleWind(grid, p.lat, p.lon);
  const latRad = (p.lat * Math.PI) / 180;
  const cosLat = Math.max(Math.cos(latRad), 0.15); // evita explosão de dLon perto do polo
  const dLon = ((u * TIME_STEP_SECONDS) / (EARTH_RADIUS_M * cosLat)) * (180 / Math.PI);
  const dLat = ((v * TIME_STEP_SECONDS) / EARTH_RADIUS_M) * (180 / Math.PI);
  const lat = p.lat + dLat;
  const lon = (((p.lon + dLon) % 360) + 360) % 360;
  const age = p.age + 1;

  if (age >= MAX_AGE_FRAMES || lat > MAX_LAT || lat < -MAX_LAT) {
    return createRandomParticle();
  }
  return { lat, lon, age };
}
