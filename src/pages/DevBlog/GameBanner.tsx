import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { track } from "../../utils/track";

export const GAME_URL = "https://copaaspirador.brunokobi.tech";

const GameBanner = () => (
  <Flex
    as="a"
    href={GAME_URL}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => track({ event: "game_banner_click", page: GAME_URL })}
    aria-label="Jogar Copa Aspirador no navegador"
    direction={{ base: "column", sm: "row" }}
    align="center"
    gap={4}
    mb={8}
    p={3}
    border="1px solid rgba(0,180,216,0.5)"
    borderRadius="12px"
    bg="linear-gradient(90deg, rgba(0,180,216,0.12), rgba(66,201,32,0.08))"
    transition="all 0.2s"
    _hover={{ borderColor: "#00b4d8", boxShadow: "0 0 18px rgba(0,180,216,0.35)" }}
  >
    <Image
      src="/blog/copa-aspirador/partida-estadio-gol.webp"
      alt="Partida do Copa Aspirador com a torcida comemorando um gol"
      w={{ base: "100%", sm: "180px" }}
      borderRadius="8px"
      loading="lazy"
      flexShrink={0}
    />
    <Box flex="1">
      <Text fontSize="xs" fontFamily="mono" color="#00b4d8" letterSpacing="0.1em" mb={1}>
        MEU JOGO · GRÁTIS NO NAVEGADOR
      </Text>
      <Text fontWeight="bold" color="white" fontSize={{ base: "md", md: "lg" }} lineHeight="1.3">
        Copa Aspirador: robôs aspiradores jogam bola e ninguém varre a sala
      </Text>
      <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
        Futebol arcade feito em Python, com campanha, carreira e torcida. Jogar agora ↗
      </Text>
    </Box>
  </Flex>
);

export default GameBanner;
