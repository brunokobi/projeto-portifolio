// Selo de status ao vivo dos serviços que rodam em produção na infra própria.
// Status e latência são medidos no navegador do visitante; os números do
// dataset vêm do /estatisticas da API, lido pela function infra-stats (a API
// não libera CORS).
//
// Por que <img> em vez de fetch(): fetch(url, {mode:"no-cors"}) cai no ORB
// (Opaque Response Blocking) do Chrome e dava falso "offline" com o serviço no
// ar. Carregar uma imagem estática conhecida via onload/onerror não sofre esse
// bloqueio e é a técnica clássica de "ping" cross-origin.
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, HStack, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import falar from "../TextAudio";

type Status = "checking" | "up" | "down";

interface Check {
  status: Status;
  latencyMs?: number;
}

interface Service {
  label: string;
  detail: string;
  // Imagem estática que sempre responde 200 quando o serviço está no ar.
  pingUrl: string;
  links?: { label: string; href: string }[];
}

interface DatasetStats {
  empresas: number;
  municipios: number;
  processosJudiciais: number;
  socios: number;
  empresasComPendencia: number;
}

const SERVICES: Service[] = [
  {
    label: "JARVIS (n8n self-hosted)",
    detail: "Agente do chat deste site",
    pingUrl: "https://n8n.brunokobi.tech/favicon.ico",
  },
  {
    label: "Dataset Grande Vitória",
    detail: "API REST (FastAPI), dashboard e servidor MCP",
    pingUrl: "https://empresas.brunokobi.tech/og-image.png",
    links: [
      { label: "dashboard", href: "https://empresas.brunokobi.tech/" },
      { label: "API", href: "https://empresas.brunokobi.tech/docs" },
    ],
  },
];

const CHECK_TIMEOUT_MS = 6000;
const RECHECK_INTERVAL_MS = 60_000;
const STATS_URL = "/.netlify/functions/infra-stats";

function pingImage(url: string): Promise<Check> {
  return new Promise((resolve) => {
    const img = new Image();
    const start = performance.now();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve({ status: "down" });
    }, CHECK_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve({ status: "up", latencyMs: Math.round(performance.now() - start) });
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve({ status: "down" });
    };
    // cache-busting: queremos saber se está no ar agora, não se já esteve
    img.src = `${url}?_t=${Date.now()}`;
  });
}

function isDatasetStats(value: unknown): value is DatasetStats {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return ["empresas", "municipios", "processosJudiciais", "socios", "empresasComPendencia"].every(
    (key) => typeof v[key] === "number"
  );
}

const DOT_COLOR: Record<Status, string> = {
  checking: "whiteAlpha.400",
  up: "#42c920",
  down: "#ff4d4d",
};

const STATUS_TEXT: Record<Status, string> = {
  checking: "verificando...",
  up: "online",
  down: "offline",
};

const formatCount = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(d);

const StatusDot = ({ status }: { status: Status }) => (
  <Box
    w="8px"
    h="8px"
    mt="6px"
    borderRadius="full"
    bg={DOT_COLOR[status]}
    flexShrink={0}
    style={
      status === "up"
        ? { boxShadow: "0 0 6px #42c920", animation: "aboutStatusPulse 2s ease infinite" }
        : undefined
    }
  />
);

const Stat = ({ value, label }: { value: string; label: string }) => (
  <Box>
    <Text fontSize="md" fontWeight="bold" color="#42c920" fontFamily="monospace" lineHeight="1.2">
      {value}
    </Text>
    <Text fontSize="xs" color="whiteAlpha.500">
      {label}
    </Text>
  </Box>
);

const ServiceStatus = () => {
  const [checks, setChecks] = useState<Check[]>(SERVICES.map(() => ({ status: "checking" })));
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const runRef = useRef(0);

  const runChecks = useCallback(() => {
    const run = ++runRef.current;
    Promise.all(
      SERVICES.map((service, i) =>
        pingImage(service.pingUrl).then((check) => {
          if (runRef.current !== run) return;
          setChecks((prev) => prev.map((c, j) => (j === i ? check : c)));
        })
      )
    ).then(() => {
      if (runRef.current === run) setCheckedAt(new Date());
    });
  }, []);

  const recheck = useCallback(() => {
    setChecks(SERVICES.map(() => ({ status: "checking" })));
    runChecks();
  }, [runChecks]);

  useEffect(() => {
    runChecks();
    const id = setInterval(recheck, RECHECK_INTERVAL_MS);
    return () => {
      clearInterval(id);
      runRef.current++;
    };
  }, [runChecks, recheck]);

  useEffect(() => {
    let cancelled = false;
    fetch(STATS_URL, { signal: AbortSignal.timeout(10_000) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (!cancelled && isDatasetStats(data)) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const checking = checks.some((c) => c.status === "checking");

  return (
    <Box
      maxW="500px"
      w="100%"
      mx="auto"
      p={4}
      borderRadius="md"
      border="1px solid"
      borderColor="whiteAlpha.200"
      onMouseOver={() => falar("Status dos serviços em produção")}
    >
      <style>{`@keyframes aboutStatusPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      <Text fontSize="xs" color="whiteAlpha.500" letterSpacing="0.15em" mb={1} textTransform="uppercase">
        Infra própria em produção — checado agora, no seu navegador
      </Text>
      <Text fontSize="xs" color="whiteAlpha.400" mb={3}>
        VPS Oracle Cloud em Frankfurt, atrás da Cloudflare
      </Text>

      <Stack spacing={3}>
        {SERVICES.map((service, i) => (
          <HStack key={service.pingUrl} spacing={3} align="flex-start">
            <StatusDot status={checks[i].status} />
            <Box flex={1} minW={0}>
              <Text fontSize="sm" color="whiteAlpha.800">
                {service.label}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.500">
                {service.detail}
                {service.links?.map((link) => (
                  <span key={link.href}>
                    {" · "}
                    <Link href={link.href} isExternal color="#42c920">
                      {link.label}
                    </Link>
                  </span>
                ))}
              </Text>
            </Box>
            <Box textAlign="right" flexShrink={0}>
              <Text fontSize="xs" color="whiteAlpha.400">
                {STATUS_TEXT[checks[i].status]}
              </Text>
              {checks[i].latencyMs !== undefined && (
                <Text fontSize="xs" color="whiteAlpha.400" fontFamily="monospace">
                  {checks[i].latencyMs} ms
                </Text>
              )}
            </Box>
          </HStack>
        ))}
      </Stack>

      {stats && (
        <Box mt={4} pt={3} borderTop="1px solid" borderColor="whiteAlpha.200">
          <Text fontSize="xs" color="whiteAlpha.500" mb={2}>
            Dataset agora, lido da API
          </Text>
          <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3}>
            <Stat value={formatCount(stats.empresas)} label={`empresas em ${stats.municipios} municípios`} />
            <Stat value={formatCount(stats.empresasComPendencia)} label="com alguma pendência" />
            <Stat value={formatCount(stats.processosJudiciais)} label="processos judiciais" />
            <Stat value={formatCount(stats.socios)} label="sócios" />
          </SimpleGrid>
        </Box>
      )}

      <HStack mt={4} justify="space-between" flexWrap="wrap" gap={2}>
        <Text fontSize="xs" color="whiteAlpha.400">
          {checkedAt ? `Última checagem: ${formatTime(checkedAt)} · repete a cada 60s` : "Checando..."}
        </Text>
        <Button
          size="xs"
          variant="outline"
          colorScheme="green"
          onClick={recheck}
          isDisabled={checking}
        >
          Verificar de novo
        </Button>
      </HStack>
    </Box>
  );
};

export default ServiceStatus;
