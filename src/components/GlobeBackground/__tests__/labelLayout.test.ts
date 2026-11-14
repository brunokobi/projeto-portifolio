import { describe, expect, it } from "vitest";
import { overlapsAny } from "../labelLayout";

describe("overlapsAny", () => {
  const placed = [{ x: 100, y: 100, w: 80, h: 14 }];

  it("detecta um nome que encostaria em outro já desenhado", () => {
    expect(overlapsAny({ x: 150, y: 108, w: 60, h: 14 }, placed)).toBe(true);
  });

  it("libera um nome em espaço vazio", () => {
    expect(overlapsAny({ x: 100, y: 120, w: 60, h: 14 }, placed)).toBe(false);
    expect(overlapsAny({ x: 190, y: 100, w: 60, h: 14 }, placed)).toBe(false);
  });
});
