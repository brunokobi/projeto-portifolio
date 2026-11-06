// Escala dos ícones desenhados no canvas conforme a altitude da câmera (metros).
// Perto (zoom máximo ~4.000 km) os ícones ficam no tamanho cheio; afastado
// (~25.000 km) caem pra metade, pra não amontoar quando o globo fica pequeno.
const NEAR_ALTITUDE_M = 8_000_000;
const FAR_ALTITUDE_M = 22_000_000;
const MIN_ICON_SCALE = 0.5;
const MIN_FONT_PX = 7;

// Abaixo dessa escala as legendas curtas fixas (ex.: "Nav", "Weather") somem;
// o nome continua no hover.
export const SHORT_LABEL_MIN_SCALE = 0.75;

export function iconScaleForAltitude(altitudeM: number): number {
  const t = Math.min(1, Math.max(0, (altitudeM - NEAR_ALTITUDE_M) / (FAR_ALTITUDE_M - NEAR_ALTITUDE_M)));
  return 1 - t * (1 - MIN_ICON_SCALE);
}

export function scaledFontPx(px: number, scale: number): number {
  return Math.max(MIN_FONT_PX, Math.round(px * scale));
}

// Espessura das linhas de vento: mais grossas com a câmera perto, finas com o
// globo afastado. Na altitude inicial (~20.000 km) fica perto de 1,3px.
const WIND_NEAR_ALTITUDE_M = 4_000_000;
const WIND_FAR_ALTITUDE_M = 22_000_000;
const WIND_MAX_LINE_PX = 3.5;
const WIND_MIN_LINE_PX = 1.1;

export function windLineWidthForAltitude(altitudeM: number): number {
  const t = Math.min(
    1,
    Math.max(0, (altitudeM - WIND_NEAR_ALTITUDE_M) / (WIND_FAR_ALTITUDE_M - WIND_NEAR_ALTITUDE_M))
  );
  return WIND_MAX_LINE_PX - t * (WIND_MAX_LINE_PX - WIND_MIN_LINE_PX);
}
