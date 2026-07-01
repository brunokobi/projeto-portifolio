import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import type { Tracer, Span } from "@opentelemetry/api";

export { SpanStatusCode };
export type { Span };

let _provider: NodeTracerProvider | null = null;
let _initialized = false;

function parseHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf("=");
    if (idx > 0) {
      headers[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  }
  return headers;
}

function initProvider(): NodeTracerProvider | null {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) return null;

  const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS
    ? parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS)
    : {};

  const exporter = new OTLPTraceExporter({
    url: `${endpoint.replace(/\/$/, "")}/v1/traces`,
    headers,
  });

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      "service.name": "portifolio-brunokobi",
      "service.version": "1.0.0",
      "deployment.environment": process.env.CONTEXT ?? "production",
    }),
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });

  provider.register();
  return provider;
}

function getProvider(): NodeTracerProvider | null {
  if (!_initialized) {
    _initialized = true;
    _provider = initProvider();
  }
  return _provider;
}

export function getTracer(name: string): Tracer | null {
  const p = getProvider();
  if (!p) return null;
  return trace.getTracer(name, "1.0.0");
}

export async function flushOtel(): Promise<void> {
  try {
    if (_provider) await _provider.forceFlush();
  } catch {
    // never let otel crash a function
  }
}
