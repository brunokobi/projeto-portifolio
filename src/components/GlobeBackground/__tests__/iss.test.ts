import { describe, it, expect } from "vitest";
import { parseIssPosition } from "../iss";

describe("parseIssPosition", () => {
  it("extrai latitude/longitude da resposta da wheretheiss.at", () => {
    const json = { latitude: 20.945769312447, longitude: -61.865061652716, altitude: 416.2 };
    expect(parseIssPosition(json)).toEqual({ lat: 20.945769312447, lon: -61.865061652716 });
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
