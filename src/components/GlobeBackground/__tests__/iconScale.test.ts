import { describe, expect, it } from "vitest";
import { iconScaleForAltitude, scaledFontPx, windLineWidthForAltitude } from "../iconScale";

describe("iconScaleForAltitude", () => {
  it("mantém o tamanho cheio com o zoom de perto", () => {
    expect(iconScaleForAltitude(4_000_000)).toBe(1);
    expect(iconScaleForAltitude(8_000_000)).toBe(1);
  });

  it("cai pra metade com o globo afastado", () => {
    expect(iconScaleForAltitude(22_000_000)).toBe(0.5);
    expect(iconScaleForAltitude(70_000_000)).toBe(0.5);
  });

  it("diminui de forma contínua entre os dois extremos", () => {
    expect(iconScaleForAltitude(15_000_000)).toBeCloseTo(0.75);
  });
});

describe("scaledFontPx", () => {
  it("escala a fonte e não deixa ficar ilegível", () => {
    expect(scaledFontPx(14, 1)).toBe(14);
    expect(scaledFontPx(14, 0.5)).toBe(7);
    expect(scaledFontPx(9, 0.5)).toBe(7);
  });
});

describe("windLineWidthForAltitude", () => {
  it("engrossa as linhas com a câmera perto", () => {
    expect(windLineWidthForAltitude(4_000_000)).toBe(3.5);
    expect(windLineWidthForAltitude(10_000_000)).toBeCloseTo(2.7);
  });

  it("mantém a espessura atual na altitude inicial e afina ao afastar", () => {
    expect(windLineWidthForAltitude(19_921_223)).toBeCloseTo(1.38, 1);
    expect(windLineWidthForAltitude(70_000_000)).toBe(1.1);
  });
});
