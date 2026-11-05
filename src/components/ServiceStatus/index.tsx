// Selo de status ao vivo dos serviços que rodam em produção na infra própria
// (VPS Oracle Cloud). Checagem 100% client-side, sem backend novo: cada
// visitante confere na hora.
//
// Por que <img> em vez de fetch(): a primeira versão usava
// fetch(url, {mode:"no-cors"}), mas o ORB (Opaque Response Blocking) do
// Chrome bloqueia respostas HTML/JSON cross-origin buscadas via no-cors —
// dava falso "offline" com o serviço no ar (confirmado testando ao vivo).
// Carregar uma imagem estática conhecida de cada serviço via onload/onerror
// não sofre esse bloqueio e é a técnica clássica de "ping" cross-origin.
import { useEffect, useState } from "react";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import falar from "../../components/TextAudio";

type Status = "checking" | "up" | "down";

interface Service {
  label: string;
  // Precisa ser uma imagem estática que sempre responde 200 quando o
  // serviço está no ar (favicon, og-image etc.) — não a página em si.
  pingUrl: string;
}

const SERVICES: Service[] = [
  { label: "chatBruno (n8n, AWS/Oracle self-hosted)", pingUrl: "https://n8n.brunokobi.tech/favicon.ico" },
  { label: "Dataset Grande Vitória (351k empresas)", pingUrl: "https://empresas.brunokobi.tech/og-image.png" },
];

const CHECK_TIMEOUT_MS = 6000;

function pingImage(url: string): Promise<Status> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve("down");
    }, CHECK_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve("up");
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve("down");
    };
    // cache-busting: queremos saber se está no ar agora, não se já esteve
    img.src = `${url}?_t=${Date.now()}`;
  });
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
      pingImage(service.pingUrl).then((status) => {
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
          <HStack key={service.pingUrl} spacing={3}>
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
