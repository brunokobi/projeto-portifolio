import { describe, it, expect } from "vitest";
import {
  buildOceanCoords,
  parseOceanResponse,
  oceanSpeedToColor,
  createRandomOceanParticle,
  advanceOceanParticle,
} from "../ocean";

describe("buildOceanCoords", () => {
  it("gera 36x17 pontos (10° de espaçamento, lat até ±80°)", () => {
    const coords = buildOceanCoords();
    expect(coords.length).toBe(36 * 17);
  });

  it("cobre lon -180..170 e lat 80..-80, nessa ordem (linha a linha)", () => {
    const coords = buildOceanCoords();
    expect(coords[0]).toEqual({ lat: 80, lon: -180 });
    expect(coords[35]).toEqual({ lat: 80, lon: 170 });
    expect(coords[36]).toEqual({ lat: 70, lon: -180 });
    expect(coords[coords.length - 1]).toEqual({ lat: -80, lon: 170 });
  });
});

describe("parseOceanResponse", () => {
  const coordCount = 4;

  it("rejeita quando o array não bate com o número de coordenadas pedidas", () => {
    expect(parseOceanResponse([{}, {}], coordCount)).toBeNull();
  });

  it("rejeita entrada que não é array", () => {
    expect(parseOceanResponse({ not: "an array" }, coordCount)).toBeNull();
  });

  it("ponto em terra (sem hourly válido) fica com corrente zero, não inventa valor", () => {
    const json = [
      { hourly: { ocean_current_velocity: [null], ocean_current_direction: [null] } },
      { hourly: { ocean_current_velocity: [1.8], ocean_current_direction: [90] } },
      {},
      { hourly: { ocean_current_velocity: [], ocean_current_direction: [] } },
    ];
    const grid = parseOceanResponse(json, coordCount);
    expect(grid).not.toBeNull();
    expect(grid!.u[0]).toBe(0);
    expect(grid!.v[0]).toBe(0);
    expect(grid!.u[2]).toBe(0);
    expect(grid!.u[3]).toBe(0);
  });

  it("converte km/h pra m/s e direção 'pra onde vai' (90°=leste) em u positivo", () => {
    const json = [
      { hourly: { ocean_current_velocity: [3.6], ocean_current_direction: [90] } },
      {},
      {},
      {},
    ];
    const grid = parseOceanResponse(json, coordCount)!;
    expect(grid.u[0]).toBeCloseTo(1, 5); // 3.6km/h = 1m/s, todo pra leste
    expect(grid.v[0]).toBeCloseTo(0, 5);
  });

  it("direção 0° (norte) vira v positivo, u zero", () => {
    const json = [
      { hourly: { ocean_current_velocity: [3.6], ocean_current_direction: [0] } },
      {},
      {},
      {},
    ];
    const grid = parseOceanResponse(json, coordCount)!;
    expect(grid.v[0]).toBeCloseTo(1, 5);
    expect(grid.u[0]).toBeCloseTo(0, 5);
  });
});

describe("oceanSpeedToColor", () => {
  it("corrente calma (0 m/s) fica na ponta azul da escala", () => {
    expect(oceanSpeedToColor(0)).toBe("rgb(20,70,140)");
  });

  it("corrente forte (>= topo da escala) fica na ponta vermelha/laranja", () => {
    expect(oceanSpeedToColor(10)).toBe("rgb(230,90,40)");
  });

  it("é bem mais sensível que a escala de vento — 1 m/s já não é mais a cor calma", () => {
    expect(oceanSpeedToColor(1)).not.toBe(oceanSpeedToColor(0));
  });
});

describe("createRandomOceanParticle", () => {
  it("sempre gera lat/lon dentro dos limites válidos", () => {
    for (let i = 0; i < 50; i++) {
      const p = createRandomOceanParticle();
      expect(p.lat).toBeGreaterThanOrEqual(-80);
      expect(p.lat).toBeLessThanOrEqual(80);
      expect(p.lon).toBeGreaterThanOrEqual(0);
      expect(p.lon).toBeLessThan(360);
    }
  });
});

describe("advanceOceanParticle", () => {
  function makeGrid(u: number[], v: number[]) {
    return { nx: 4, ny: 3, lo1: -180, la1: 80, dx: 10, dy: 10, u: Float32Array.from(u), v: Float32Array.from(v) };
  }

  it("com corrente zero, a posição não muda (só a idade avança)", () => {
    const calmGrid = makeGrid(new Array(12).fill(0), new Array(12).fill(0));
    const p = { lat: 10, lon: 20, age: 0 };
    const next = advanceOceanParticle(p, calmGrid);
    expect(next.lat).toBeCloseTo(10, 5);
    expect(next.lon).toBeCloseTo(20, 5);
    expect(next.age).toBe(1);
  });

  it("respawna quando passa da idade máxima (300 frames)", () => {
    const calmGrid = makeGrid(new Array(12).fill(0), new Array(12).fill(0));
    const p = { lat: 10, lon: 20, age: 299 };
    const next = advanceOceanParticle(p, calmGrid);
    expect(next.age).toBeLessThan(300);
  });

  it("com corrente real, a posição avança (idade zerada não conta como encalhe)", () => {
    const windyGrid = makeGrid(new Array(12).fill(0.5), new Array(12).fill(0));
    const p = { lat: 0, lon: 20, age: 0 };
    const next = advanceOceanParticle(p, windyGrid);
    expect(next.lon).toBeGreaterThan(20);
    expect(next.age).toBe(1);
  });
});
