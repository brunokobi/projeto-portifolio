import { useEffect, useState } from "react";
import { Box, Heading, Text, Skeleton } from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VisitCounter = () => {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    const updateCounter = async () => {
      const { data, error } = await supabase.rpc("increment_views");
      if (error) {
        console.error("Erro ao atualizar visitas:", error);
      } else {
        setVisits(data);
      }
    };
    updateCounter();
  }, []);

  // Cores do tema Arcade
  const arcadeGreen = "#39ff14"; // Verde Base
  const darkMetalBg = "rgba(26, 26, 26, 0.95)"; 
  const screenBlack = "#050505";

  return (
    <Box
      position="fixed"
      top={{ base: "15px", md: "25px" }}
      left={{ base: "15px", md: "25px" }}
      zIndex="9999"
      bg={darkMetalBg}
      border="3px solid"
      borderColor={arcadeGreen} // Borda externa continua brilhante
      borderRadius="lg"
      boxShadow={`0 0 10px ${arcadeGreen}40, inset 0 0 15px ${arcadeGreen}20`} // Reduzi um pouco o brilho externo geral também
      p={3}
      textAlign="center"
      fontFamily="'Orbitron', sans-serif"
      backdropFilter="blur(5px)"
    >
      {/* Etiqueta "PLAYER VISITS" */}
      <Heading
        fontSize={{ base: "xs", md: "sm" }}
        color={`${arcadeGreen}90`} // Verde com 90% de opacidade
        letterSpacing="widest"
        mb={2}
        textTransform="uppercase"
        fontWeight="700"
        textShadow={`0 0 2px ${arcadeGreen}50`} // Brilho suave
      >
        PLAYER VISITS
      </Heading>

      {/* A "Tela Digital" interna */}
      <Box
        bg={screenBlack}
        border="2px inset"
        borderColor={`${arcadeGreen}20`} 
        borderRadius="md"
        px={{ base: 3, md: 5 }}
        py={2}
        boxShadow={`inset 0 0 15px ${screenBlack}`} 
        minW="110px"
      >
        {visits === null ? (
          <Skeleton
            height="32px"
            startColor={screenBlack}
            endColor={`${arcadeGreen}20`}
            borderRadius="sm"
            opacity={0.5}
          />
        ) : (
          // O Número Digital (Agora igual ao texto)
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="700"
            // AQUI ESTÁ A MUDANÇA:
            // Usando a mesma cor e sombra do título acima
            color={`${arcadeGreen}90`} 
            textShadow={`0 0 2px ${arcadeGreen}50`}
            letterSpacing="3px"
            lineHeight="1"
          >
            {visits.toLocaleString("pt-BR")}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default VisitCounter;