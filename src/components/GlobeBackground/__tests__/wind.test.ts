import { describe, it, expect } from "vitest";
import {
  parseWindGrid,
  sampleWind,
  advanceParticle,
  createRandomParticle,
  windDashEnd,
  type WindGrid,
} from "../wind";

// Grade sintética pequena (4 colunas x 3 linhas: lon 0/90/180/270, lat 90/0/-90)
// só pra testar a matemática de interpolação/wrap sem depender do arquivo real.
function makeGrid(u: number[], v: number[]): WindGrid {
  return { nx: 4, ny: 3, lo1: 0, la1: 90, dx: 90, dy: 90, u: Float32Array.from(u), v: Float32Array.from(v) };
}

describe("parseWindGrid", () => {
  it("aceita o formato nullschool válido (2 camadas, header + data)", () => {
    const json = [
      { header: { nx: 2, ny: 2, lo1: 0, la1: 90, dx: 180, dy: 180 }, data: [1, 2, 3, 4] },
      { header: { nx: 2, ny: 2, lo1: 0, la1: 90, dx: 180, dy: 180 }, data: [5, 6, 7, 8] },
    ];
    const grid = parseWindGrid(json);
    expect(grid).not.toBeNull();
    expect(grid?.nx).toBe(2);
    expect(Array.from(grid!.u)).toEqual([1, 2, 3, 4]);
    expect(Array.from(grid!.v)).toEqual([5, 6, 7, 8]);
  });

  it("rejeita entrada que não é array", () => {
    expect(parseWindGrid({ not: "an array" })).toBeNull();
  });

  it("rejeita quando falta a segunda camada", () => {
    expect(parseWindGrid([{ header: {}, data: [] }])).toBeNull();
  });

  it("rejeita quando o tamanho de data não bate com nx*ny", () => {
    const json = [
      { header: { nx: 2, ny: 2, lo1: 0, la1: 90, dx: 180, dy: 180 }, data: [1, 2] },
      { header: { nx: 2, ny: 2, lo1: 0, la1: 90, dx: 180, dy: 180 }, data: [5, 6, 7, 8] },
    ];
    expect(parseWindGrid(json)).toBeNull();
  });
});

describe("sampleWind", () => {
  it("retorna o valor exato num ponto da grade (sem erro de interpolação)", () => {
    // lat 0 (linha 1), lon 90 (coluna 1) → índice 1*4+1 = 5
    const u = [0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0];
    const v = new Array(12).fill(0);
    const grid = makeGrid(u, v);
    expect(sampleWind(grid, 0, 90).u).toBeCloseTo(10, 5);
  });

  it("interpola pela metade entre dois pontos vizinhos", () => {
    // linha 0 (lat 90): colunas 0 e 1 = 0 e 10 → meio (lon 45) deve dar 5
    const u = [0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const v = new Array(12).fill(0);
    const grid = makeGrid(u, v);
    expect(sampleWind(grid, 90, 45).u).toBeCloseTo(5, 5);
  });

  it("dá wrap na longitude (359°+ volta pra coluna 0)", () => {
    // colunas 3 (lon 270) e 0 (lon 0, "360") na linha 0: 0 e 20 → meio (lon 315) = 10
    const u = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    u[3] = 0; // coluna 3 = lon 270
    u[0] = 20; // coluna 0 = lon 0 (equivale a 360)
    const v = new Array(12).fill(0);
    const grid = makeGrid(u, v);
    expect(sampleWind(grid, 90, 315).u).toBeCloseTo(10, 5);
  });

  it("não quebra nos polos (clamp em vez de sair da grade)", () => {
    const grid = makeGrid(new Array(12).fill(1), new Array(12).fill(2));
    expect(() => sampleWind(grid, 90, 0)).not.toThrow();
    expect(() => sampleWind(grid, -90, 0)).not.toThrow();
  });
});

describe("advanceParticle", () => {
  const calmGrid = makeGrid(new Array(12).fill(0), new Array(12).fill(0));

  it("com vento zero, a posição não muda (só a idade avança)", () => {
    const p = { lat: 10, lon: 20, age: 0 };
    const next = advanceParticle(p, calmGrid);
    expect(next.lat).toBeCloseTo(10, 5);
    expect(next.lon).toBeCloseTo(20, 5);
    expect(next.age).toBe(1);
  });

  it("vento de leste (u>0) desloca a longitude pra leste", () => {
    const windyGrid = makeGrid(new Array(12).fill(15), new Array(12).fill(0));
    const p = { lat: 0, lon: 20, age: 0 };
    const next = advanceParticle(p, windyGrid);
    expect(next.lon).toBeGreaterThan(20);
  });

  it("respawna (reseta) quando passa da idade máxima", () => {
    const p = { lat: 10, lon: 20, age: 149 };
    const next = advanceParticle(p, calmGrid);
    // uma partícula recém-nascida tem age baixa comparada ao limite (150)
    expect(next.age).toBeLessThan(150);
  });

  it("respawna perto do polo (lat > 75) em vez de deixar a partícula lá", () => {
    const strongNorthWind = makeGrid(new Array(12).fill(0), new Array(12).fill(1000));
    const p = { lat: 74, lon: 20, age: 0 };
    const next = advanceParticle(p, strongNorthWind);
    expect(Math.abs(next.lat)).toBeLessThanOrEqual(75);
  });
});

describe("windDashEnd", () => {
  it("não muda o estado de nenhuma partícula — é só um ponto de desenho", () => {
    const windyGrid = makeGrid(new Array(12).fill(15), new Array(12).fill(0));
    const end = windDashEnd(windyGrid, 0, 20, 250);
    expect(end.lon).toBeGreaterThan(20);
    // sem campo "age" no retorno — não é um WindParticle
    expect((end as { age?: number }).age).toBeUndefined();
  });
});

describe("createRandomParticle", () => {
  it("sempre gera lat/lon dentro dos limites válidos", () => {
    for (let i = 0; i < 50; i++) {
      const p = createRandomParticle();
      expect(p.lat).toBeGreaterThanOrEqual(-75);
      expect(p.lat).toBeLessThanOrEqual(75);
      expect(p.lon).toBeGreaterThanOrEqual(0);
      expect(p.lon).toBeLessThan(360);
    }
  });
});
