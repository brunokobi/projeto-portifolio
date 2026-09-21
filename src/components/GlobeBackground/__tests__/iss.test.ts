import { describe, it, expect } from "vitest";
import { parseIssPosition } from "../iss";

describe("parseIssPosition", () => {
  it("extrai lat/lon/altitude/velocidade da resposta da wheretheiss.at", () => {
    const json = { latitude: 20.945769312447, longitude: -61.865061652716, altitude: 416.2, velocity: 27598.6 };
    expect(parseIssPosition(json)).toEqual({
      lat: 20.945769312447,
      lon: -61.865061652716,
      altitude: 416.2,
      velocity: 27598.6,
    });
  });

  it("altitude/velocidade ficam undefined se ausentes, sem invalidar a posição", () => {
    expect(parseIssPosition({ latitude: 1, longitude: 2 })).toEqual({ lat: 1, lon: 2, altitude: undefined, velocity: undefined });
  });

  it("rejeita quando falta latitude ou longitude", () => {
    expect(parseIssPosition({ latitude: 10 })).toBeNull();
    expect(parseIssPosition({})).toBeNull();
  });

  it("rejeita valores que não são número (ex: NaN, string)", () => {
    expect(parseIssPosition({ latitude: NaN, longitude: 10 })).toBeNull();
    expect(parseIssPosition({ latitude: "10", longitude: "20" })).toBeNull();
  });
});
