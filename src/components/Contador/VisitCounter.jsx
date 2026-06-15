import { useEffect, useState } from "react";
import { Box, Text, Skeleton } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { createClient } from "@supabase/supabase-js";
import { useIntl } from "react-intl";
import falar from "../TextAudio";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const flicker = keyframes`
  0%, 89%, 91%, 93%, 100% { opacity: 1; }
  90%, 92% { opacity: 0.75; }
`;

const digitPulse = keyframes`
  0%, 100% { text-shadow: 0 0 4px #42c920, 0 0 12px #39ff14, 0 0 24px #1a8f00; }
  50%       { text-shadow: 0 0 8px #42c920, 0 0 20px #39ff14, 0 0 36px #2ab800; }
`;

const Rivet = ({ top, left, right, bottom }) => (
  <Box
    position="absolute"
    top={top} left={left} right={right} bottom={bottom}
    w="7px" h="7px"
    borderRadius="full"
    bg="linear-gradient(135deg, #7a4a2a 0%, #3d1e0a 50%, #5c3317 100%)"
    boxShadow="inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(255,180,80,0.15)"
    border="1px solid #2a1008"
  />
);

const VisitCounter = () => {
  const [visits, setVisits] = useState(null);
  const intl = useIntl();
  const label = intl.formatMessage({ id: "visitas" });

  useEffect(() => {
    const updateCounter = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.rpc("increment_views");
      if (!error) setVisits(data);
    };
    updateCounter();
  }, []);

  return (
    <Box
      position="fixed"
      top={{ base: "12px", md: "20px" }}
      left={{ base: "12px", md: "20px" }}
      zIndex="100"
      onMouseEnter={() => visits !== null && falar(`${visits} ${label}`)}
      // Placa metálica enferrujada
      bg="linear-gradient(145deg, #1c0f06 0%, #2e1a0a 25%, #1a0c05 55%, #28160a 75%, #1e1008 100%)"
      borderRadius="6px"
      p="2px"
      boxShadow={`
        0 0 0 1px #5c3317,
        0 0 0 3px #2a1008,
        0 0 0 4px #6b3d1a,
        4px 6px 18px rgba(0,0,0,0.9),
        inset 0 1px 0 rgba(255,160,60,0.08)
      `}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "6px",
        background: `
          radial-gradient(ellipse at 18% 20%, rgba(139,60,10,0.35) 0%, transparent 38%),
          radial-gradient(ellipse at 78% 72%, rgba(120,50,5,0.28) 0%, transparent 32%),
          radial-gradient(ellipse at 55% 5%,  rgba(90,40,0,0.4)   0%, transparent 25%),
          radial-gradient(ellipse at 8%  80%, rgba(100,45,0,0.22) 0%, transparent 30%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Conteúdo interno */}
      <Box
        position="relative"
        zIndex={1}
        bg="linear-gradient(160deg, #160a03 0%, #1f1108 50%, #160a03 100%)"
        borderRadius="4px"
        px={2}
        pt="7px"
        pb="7px"
        minW={{ base: "82px", md: "98px" }}
        overflow="hidden"
        // Riscos / scratches
        _after={{
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            repeating-linear-gradient(
              92deg,
              transparent 0px, transparent 14px,
              rgba(255,255,255,0.012) 14px, rgba(255,255,255,0.012) 15px
            )
          `,
          pointerEvents: "none",
        }}
      >
        {/* Rebites nos cantos */}
        <Rivet top="5px"  left="5px"  />
        <Rivet top="5px"  right="5px" />
        <Rivet bottom="5px" left="5px"  />
        <Rivet bottom="5px" right="5px" />

        {/* Label estêncil */}
        <Text
          fontSize="8px"
          fontFamily="'Courier New', monospace"
          fontWeight="900"
          letterSpacing="0.2em"
          textTransform="uppercase"
          textAlign="center"
          mb="4px"
          color="#7a4a20"
          style={{
            textShadow: "0 1px 0 rgba(0,0,0,0.9), 0 0 6px rgba(180,80,10,0.3)",
            WebkitTextStroke: "0.3px #5c3010",
          }}
        >
          ▌ {label} ▐
        </Text>

        {/* Divisor enferrujado */}
        <Box
          h="1px"
          mx={2}
          mb="5px"
          bg="linear-gradient(90deg, transparent, #6b3d1a, #8b5020, #6b3d1a, transparent)"
          opacity={0.6}
        />

        {/* Display de dígitos */}
        <Box
          bg="linear-gradient(180deg, #0a0400 0%, #0e0602 100%)"
          borderRadius="3px"
          px={2}
          py="4px"
          border="1px solid #3d1e0a"
          boxShadow="inset 0 2px 8px rgba(0,0,0,0.95), inset 0 0 12px rgba(180,60,0,0.06)"
          textAlign="center"
          position="relative"
          overflow="hidden"
          // Scanlines
          _after={{
            content: '""',
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
            pointerEvents: "none",
          }}
        >
          {visits === null ? (
            <Skeleton
              height="36px"
              startColor="#0a0400"
              endColor="#3d1500"
              borderRadius="2px"
              opacity={0.6}
            />
          ) : (
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="700"
              fontFamily="'Courier New', monospace"
              letterSpacing="3px"
              lineHeight="1"
              color="#42c920"
              style={{
                animation: `${digitPulse} 3s ease-in-out infinite, ${flicker} 8s linear infinite`,
                textShadow: "0 0 4px #42c920, 0 0 14px #39ff14, 0 0 28px #1a8f00",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(visits).padStart(4, "0")}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VisitCounter;
