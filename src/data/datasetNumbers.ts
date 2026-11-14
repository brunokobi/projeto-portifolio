export interface DatasetCounts {
  empresas: number;
  socios: number;
  processos: number;
}

// Valores de 07/11/2026, usados quando o build não consegue ler a API do dataset.
export const FALLBACK_COUNTS: DatasetCounts = { empresas: 366995, socios: 242897, processos: 5215566 };

declare const __DATASET_COUNTS__: DatasetCounts | undefined;

export const DATASET_COUNTS: DatasetCounts =
  typeof __DATASET_COUNTS__ !== "undefined" ? __DATASET_COUNTS__ : FALLBACK_COUNTS;

const LOCALES: Record<string, string> = { pt: "pt-BR", kl: "en" };

export function compactNumber(n: number, locale: string, display: "long" | "short" = "long"): string {
  return new Intl.NumberFormat(LOCALES[locale] ?? locale, {
    notation: "compact",
    compactDisplay: display,
    maximumSignificantDigits: n >= 1_000_000 ? 2 : 3,
  }).format(n);
}

export function datasetValues(locale: string, counts: DatasetCounts = DATASET_COUNTS): Record<string, string> {
  return {
    empresas: compactNumber(counts.empresas, locale),
    empresasCurto: compactNumber(counts.empresas, locale, "short"),
    socios: compactNumber(counts.socios, locale),
    processos: compactNumber(counts.processos, locale),
  };
}

export function fillDatasetNumbers(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
