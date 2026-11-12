export const EMPRESAS_STATS_URL = "https://empresas.brunokobi.tech/estatisticas";

export interface DatasetStats {
  empresas: number;
  municipios: number;
  processosJudiciais: number;
  socios: number;
  empresasComPendencia: number;
}

const asCount = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

export function parseDatasetStats(json: unknown): DatasetStats | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;
  const tabelas = (data.registros_por_tabela ?? {}) as Record<string, unknown>;
  const municipios = data.por_municipio && typeof data.por_municipio === "object" ? Object.keys(data.por_municipio) : [];

  const empresas = asCount(data.total_empresas);
  const processosJudiciais = asCount(tabelas.processos_judiciais);
  const socios = asCount(tabelas.socios);
  const empresasComPendencia = asCount(data.empresas_com_pendencia);
  if (empresas === null || processosJudiciais === null || socios === null || empresasComPendencia === null) {
    return null;
  }
  return { empresas, municipios: municipios.length, processosJudiciais, socios, empresasComPendencia };
}
