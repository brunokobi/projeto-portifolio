import { describe, expect, it } from "vitest";
import { parseDatasetStats } from "../lib/infraStats";

const SAMPLE = {
  total_empresas: 366995,
  por_municipio: { "VILA VELHA": 96952, SERRA: 92000, VITORIA: 83325 },
  empresas_com_pendencia: 114254,
  registros_por_tabela: { processos_judiciais: 4356702, socios: 231890 },
};

describe("parseDatasetStats", () => {
  it("extrai os números do /estatisticas", () => {
    expect(parseDatasetStats(SAMPLE)).toEqual({
      empresas: 366995,
      municipios: 3,
      processosJudiciais: 4356702,
      socios: 231890,
      empresasComPendencia: 114254,
    });
  });

  it("recusa resposta sem os campos esperados em vez de inventar zero", () => {
    expect(parseDatasetStats({ total_empresas: 10 })).toBeNull();
    expect(parseDatasetStats({ ...SAMPLE, total_empresas: "366995" })).toBeNull();
    expect(parseDatasetStats(null)).toBeNull();
  });
});
