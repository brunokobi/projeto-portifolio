// Componentes de UI pequenos e auto-contidos do painel de notícias — extraído
// de index.tsx pra manter o arquivo principal focado no fetch/scoring/estado.
import { useMemo } from "react";
import { Box, Flex, Text, Spinner, VStack } from "@chakra-ui/react";
import { GREEN, MCHARS } from "./newsConstants";

export function MatrixLoader() {
  const drops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        char: MCHARS[(i * 7) % MCHARS.length],
        left: `${(i / 60) * 100}%`,
        delay: (i * 83) % 1400,
        dur: 0.6 + (i % 5) * 0.18,
        top: `${(i * 37) % 100}%`,
        op: 0.08 + (i % 4) * 0.07,
      })),
    []
  );

  return (
    <Flex h="70vh" align="center" justify="center" position="relative" overflow="hidden">
      {drops.map((d, i) => (
        <Text
          key={i}
          position="absolute"
          left={d.left}
          top={d.top}
          fontSize="xs"
          color={GREEN}
          fontFamily="monospace"
          userSelect="none"
          style={{ opacity: d.op, animation: `nwsMatrixFall ${d.dur}s ${d.delay}ms infinite` }}
        >
          {d.char}
        </Text>
      ))}
      <VStack spacing={4} zIndex={1}>
        <Spinner
          size="xl"
          color={GREEN}
          thickness="3px"
          style={{ animation: "nwsPulse 1.5s ease infinite" }}
        />
        <Text fontSize="sm" color={GREEN} fontFamily="monospace" letterSpacing="0.2em">
          CARREGANDO FEEDS...
        </Text>
        <Text fontSize="xs" color="whiteAlpha.300" fontFamily="monospace">
          {MCHARS.slice(0, 12).join(" ")}
        </Text>
      </VStack>
    </Flex>
  );
}

// ── Filter Button ──────────────────────────────────────────────────────────
export function FilterBtn({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <Box
      as="button"
      onClick={() => onClick(id)}
      aria-pressed={active}
      px={3}
      py={1}
      borderRadius="4px"
      fontSize="xs"
      fontFamily="heading"
      fontWeight={active ? "700" : "500"}
      color={active ? GREEN : "whiteAlpha.600"}
      bg={active ? `${GREEN}15` : "transparent"}
      transition="all .15s"
      _hover={{ color: GREEN, bg: `${GREEN}10` }}
      whiteSpace="nowrap"
      style={active ? { textShadow: `0 0 8px ${GREEN}88` } : {}}
    >
      {label}
    </Box>
  );
}
