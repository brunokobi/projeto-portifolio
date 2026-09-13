// Selo de status ao vivo dos serviços que rodam em produção na infra própria
// (VPS Oracle Cloud). Checagem 100% client-side, sem backend novo: cada
// visitante confere na hora, via fetch com mode:"no-cors" (evita CORS/leitura
// de resposta — só nos interessa se a conexão foi estabelecida ou falhou).
import { useEffect, useState } from "react";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import falar from "../../components/TextAudio";

type Status = "checking" | "up" | "down";

interface Service {
  label: string;
  url: string;
}

const SERVICES: Service[] = [
  { label: "chatBruno (n8n, AWS/Oracle self-hosted)", url: "https://n8n.brunokobi.tech/" },
  { label: "Dataset Grande Vitória (351k empresas)", url: "https://empresas.brunokobi.tech/" },
];

const CHECK_TIMEOUT_MS = 6000;

async function checkService(url: string): Promise<Status> {
  try {
    // no-cors: a resposta vem opaca (não dá pra ler status/corpo), mas isso
    // não importa aqui — só queremos saber se a conexão foi estabelecida.
    // Falha de rede/timeout rejeita a promise; resposta HTTP (mesmo erro)
    // não rejeita.
    await fetch(url, { mode: "no-cors", signal: AbortSignal.timeout(CHECK_TIMEOUT_MS) });
    return "up";
  } catch {
    return "down";
  }
}

const DOT_COLOR: Record<Status, string> = {
  checking: "whiteAlpha.400",
  up: "#42c920",
  down: "#ff4d4d",
};

const StatusDot = ({ status }: { status: Status }) => (
  <Box
    w="8px"
    h="8px"
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

const ServiceStatus = () => {
  const [statuses, setStatuses] = useState<Status[]>(SERVICES.map(() => "checking"));

  useEffect(() => {
    let cancelled = false;
    SERVICES.forEach((service, i) => {
      checkService(service.url).then((status) => {
        if (cancelled) return;
        setStatuses((prev) => {
          const next = [...prev];
          next[i] = status;
          return next;
        });
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <Text
        fontSize="xs"
        color="whiteAlpha.500"
        letterSpacing="0.15em"
        mb={3}
        textTransform="uppercase"
      >
        Infra própria em produção — checado agora, no seu navegador
      </Text>
      <Stack spacing={2}>
        {SERVICES.map((service, i) => (
          <HStack key={service.url} spacing={3}>
            <StatusDot status={statuses[i]} />
            <Text fontSize="sm" color="whiteAlpha.800">
              {service.label}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.400" ml="auto">
              {statuses[i] === "checking" ? "verificando..." : statuses[i] === "up" ? "online" : "offline"}
            </Text>
          </HStack>
        ))}
      </Stack>
    </Box>
  );
};

export default ServiceStatus;
