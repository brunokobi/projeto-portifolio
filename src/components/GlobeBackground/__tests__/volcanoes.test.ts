import { describe, it, expect } from "vitest";
import { parseVolcanoes } from "../volcanoes";

describe("parseVolcanoes", () => {
  it("extrai name/country/type/lat/lon/elevation do formato do dataset", () => {
    const json = [{ name: "Abu", country: "Japan", type: "Shield", lat: 34.5, lon: 131.6, elevation: 641 }];
    expect(parseVolcanoes(json)).toEqual([
      { name: "Abu", country: "Japan", type: "Shield", lat: 34.5, lon: 131.6, elevation: 641 },
    ]);
  });

  it("ignora entrada sem nome ou sem lat/lon numérico", () => {
    const json = [
      { country: "Japan", lat: 1, lon: 2 },
      { name: "X", lat: "1", lon: 2 },
      { name: "Y", lat: 1, lon: 2 },
    ];
    expect(parseVolcanoes(json)).toHaveLength(1);
  });

  it("country/type/elevation ficam com default sensato quando ausentes", () => {
    const json = [{ name: "Solo", lat: 1, lon: 2 }];
    expect(parseVolcanoes(json)).toEqual([{ name: "Solo", country: "", type: "", lat: 1, lon: 2, elevation: 0 }]);
  });

  it("retorna array vazio se a entrada não é array", () => {
    expect(parseVolcanoes({})).toEqual([]);
    expect(parseVolcanoes(null)).toEqual([]);
  });
});
