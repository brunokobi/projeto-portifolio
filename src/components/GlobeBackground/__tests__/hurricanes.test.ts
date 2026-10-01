import { describe, it, expect } from "vitest";
import {
  parseHurricanes,
  hurricaneColor,
  hurricaneRadius,
  hurricaneLabel,
  drawHurricaneIcon,
} from "../hurricanes";

describe("hurricanes", () => {
  describe("parseHurricanes", () => {
    it("retorna array vazio pra input inválido", () => {
      expect(parseHurricanes(null)).toEqual([]);
      expect(parseHurricanes({})).toEqual([]);
      expect(parseHurricanes([])).toEqual([]);
    });

    it("parseia furacões válidas", () => {
      const data = [
        {
          id: "test-1",
          name: "Hurricane Fay",
          lat: 29.2,
          lon: -43.9,
          windSpeed: 56,
          pressure: 1010,
          category: 0,
          movement: "S",
        },
      ];

      const result = parseHurricanes(data);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Hurricane Fay");
      expect(result[0].lat).toBe(29.2);
      expect(result[0].lon).toBe(-43.9);
    });

    it("ignora items sem lat/lon", () => {
      const data = [
        { name: "Hurricane A", lat: 10, lon: undefined },
        { name: "Hurricane B", lat: 20, lon: -30 },
      ];

      const result = parseHurricanes(data);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Hurricane B");
    });

    it("gera ID aleatório se faltando", () => {
      const data = [{ name: "Test", lat: 0, lon: 0 }];
      const result = parseHurricanes(data);
      expect(result[0].id).toBeTruthy();
    });
  });

  describe("hurricaneColor", () => {
    it("retorna cores por categoria", () => {
      expect(hurricaneColor(0)).toBe("#FFFF00"); // Tropical Storm
      expect(hurricaneColor(1)).toBe("#00CCFF"); // Cat 1
      expect(hurricaneColor(2)).toBe("#FFCC00"); // Cat 2
      expect(hurricaneColor(3)).toBe("#FF6600"); // Cat 3
      expect(hurricaneColor(4)).toBe("#FF0000"); // Cat 4
      expect(hurricaneColor(5)).toBe("#8B0000"); // Cat 5
    });
  });

  describe("hurricaneRadius", () => {
    it("retorna raio baseado em velocidade do vento", () => {
      const r1 = hurricaneRadius(0);
      const r2 = hurricaneRadius(100);

      expect(r1).toBeGreaterThan(0);
      expect(r2).toBeGreaterThan(r1);
    });

    it("limitado a range máximo", () => {
      const r = hurricaneRadius(500);
      expect(r).toBeLessThan(50); // Max plausível
    });
  });

  describe("hurricaneLabel", () => {
    it("retorna labels corretos por categoria", () => {
      expect(hurricaneLabel(0)).toBe("Tropical Storm");
      expect(hurricaneLabel(1)).toBe("Cat 1");
      expect(hurricaneLabel(5)).toBe("Cat 5");
    });
  });

  describe("drawHurricaneIcon", () => {
    it("função exportada sem erros de compilação", () => {
      expect(typeof drawHurricaneIcon).toBe("function");
    });
  });
});
