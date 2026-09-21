import { describe, it, expect } from "vitest";
import { parseQuakes, quakeColor, quakeRadius } from "../quakes";

describe("parseQuakes", () => {
  it("extrai lat/lon/mag/place/time do formato GeoJSON do USGS", () => {
    const json = {
      features: [
        {
          properties: { mag: 5.5, place: "35 km NNE of Ruteng, Indonesia", time: 1789954896315 },
          geometry: { coordinates: [120.5793, -8.307, 10] },
        },
      ],
    };
    const quakes = parseQuakes(json);
    expect(quakes).toEqual([
      { lat: -8.307, lon: 120.5793, mag: 5.5, place: "35 km NNE of Ruteng, Indonesia", time: 1789954896315 },
    ]);
  });

  it("ignora feature sem magnitude ou sem coordenadas", () => {
    const json = {
      features: [
        { properties: { mag: null }, geometry: { coordinates: [1, 2, 3] } },
        { properties: { mag: 5 }, geometry: {} },
        { properties: { mag: 5 }, geometry: { coordinates: [10, 20, 0] } },
      ],
    };
    expect(parseQuakes(json)).toHaveLength(1);
  });

  it("retorna array vazio se a entrada não tem 'features'", () => {
    expect(parseQuakes({})).toEqual([]);
    expect(parseQuakes(null)).toEqual([]);
  });
});

describe("quakeColor", () => {
  it("escala de amarelo (moderado) a vermelho (forte)", () => {
    expect(quakeColor(4.6)).toBe("#ffdc00");
    expect(quakeColor(5.2)).toBe("#ffa300");
    expect(quakeColor(5.7)).toBe("#ff6a00");
    expect(quakeColor(6.5)).toBe("#ff2d2d");
  });
});

describe("quakeRadius", () => {
  it("cresce com a magnitude", () => {
    expect(quakeRadius(5)).toBeGreaterThan(quakeRadius(4.5));
    expect(quakeRadius(7)).toBeGreaterThan(quakeRadius(5));
  });
});
