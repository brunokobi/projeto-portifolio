import { describe, expect, it } from "vitest";
import { datasetValues, fillDatasetNumbers } from "../datasetNumbers";

const counts = { empresas: 366995, socios: 242897, processos: 5215566 };

describe("datasetNumbers", () => {
  it("formata os números do dataset no idioma da página", () => {
    expect(datasetValues("pt", counts)).toMatchObject({ empresas: "367 mil", socios: "243 mil", processos: "5,2 milhões" });
    expect(datasetValues("en", counts)).toMatchObject({ empresasCurto: "367K", processos: "5.2 million" });
    expect(datasetValues("kl", counts).empresasCurto).toBe("367K");
  });

  it("preenche só os marcadores conhecidos", () => {
    expect(fillDatasetNumbers("{empresas} empresas e {outro}", { empresas: "367 mil" })).toBe("367 mil empresas e {outro}");
  });
});
