import { useEffect, useState } from "react";
import { Box, Text, Skeleton } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useIntl } from "react-intl";
import falar from "../TextAudio";
import { supabase } from "../../lib/supabase";

const flicker = keyframes`
  0%, 89%, 91%, 93%, 100% { opacity: 1; }
  90%, 92% { opacity: 0.7; }
`;

const digitPulse = keyframes`
  0%, 100% { text-shadow: 0 0 4px #00ff41, 0 0 14px #00ff41, 0 0 28px #00cc33, 0 0 50px #008822; }
  50%       { text-shadow: 0 0 8px #00ff41, 0 0 24px #00ff41, 0 0 44px #00dd44, 0 0 70px #00aa22; }
`;

const matrixRain = keyframes`
  0%   { background-position: 0% 0%;   }
  100% { background-position: 0% 200%; }
`;

const Rivet = ({
  top,
  left,
  right,
  bottom,
}: {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}) => (
  <Box
    position="absolute"
    top={top}
    left={left}
    right={right}
    bottom={bottom}
    w="7px"
    h="7px"
    borderRadius="full"
    bg="linear-gradient(135deg, #003300 0%, #001a00 50%, #002800 100%)"
    boxShadow="inset 0 1px 2px rgba(0,0,0,0.9), 0 0 4px rgba(0,255,65,0.25), 0 1px 1px rgba(0,255,65,0.1)"
    border="1px solid #004400"
  />
);

const VisitCounter = () => {
  const [visits, setVisits] = useState<number | null>(null);
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
      bg="linear-gradient(145deg, #000800 0%, #001200 25%, #000500 55%, #001000 75%, #000800 100%)"
      borderRadius="6px"
      p="2px"
      boxShadow={`
        0 0 0 1px #003300,
        0 0 0 3px #000d00,
        0 0 0 4px #004400,
        4px 6px 18px rgba(0,0,0,0.95),
        0 0 20px rgba(0,255,65,0.08),
        inset 0 1px 0 rgba(0,255,65,0.06)
      `}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "6px",
        background: `
          radial-gradient(ellipse at 18% 20%, rgba(0,80,20,0.3)  0%, transparent 38%),
          radial-gradient(ellipse at 78% 72%, rgba(0,60,10,0.22) 0%, transparent 32%),
          radial-gradient(ellipse at 55% 5%,  rgba(0,100,20,0.3) 0%, transparent 25%),
          radial-gradient(ellipse at 8%  80%, rgba(0,70,10,0.18) 0%, transparent 30%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Conteúdo interno */}
      <Box
        position="relative"
        zIndex={1}
        bg="linear-gradient(160deg, #000500 0%, #000d00 50%, #000500 100%)"
        borderRadius="4px"
        px={2}
        pt="7px"
        pb="7px"
        minW={{ base: "82px", md: "98px" }}
        overflow="hidden"
        _after={{
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            repeating-linear-gradient(
              92deg,
              transparent 0px, transparent 14px,
              rgba(0,255,65,0.015) 14px, rgba(0,255,65,0.015) 15px
            )
          `,
          pointerEvents: "none",
        }}
      >
        {/* Rebites nos cantos */}
        <Rivet top="5px" left="5px" />
        <Rivet top="5px" right="5px" />
        <Rivet bottom="5px" left="5px" />
        <Rivet bottom="5px" right="5px" />

        {/* Label estêncil Matrix */}
        <Text
          fontSize="8px"
          fontFamily="'Courier New', monospace"
          fontWeight="900"
          letterSpacing="0.2em"
          textTransform="uppercase"
          textAlign="center"
          mb="4px"
          color="#00cc33"
          style={{
            textShadow: "0 0 6px #00ff41, 0 0 12px #00aa22",
            WebkitTextStroke: "0.3px #008822",
          }}
        >
          ▌ {label} ▐
        </Text>

        {/* Divisor verde */}
        <Box
          h="1px"
          mx={2}
          mb="5px"
          bg="linear-gradient(90deg, transparent, #004400, #00ff41, #004400, transparent)"
          opacity={0.7}
        />

        {/* Display de dígitos */}
        <Box
          bg="linear-gradient(180deg, #000200 0%, #000400 100%)"
          borderRadius="3px"
          px={2}
          py="4px"
          border="1px solid #003300"
          boxShadow="inset 0 2px 8px rgba(0,0,0,0.98), inset 0 0 14px rgba(0,255,65,0.05), 0 0 8px rgba(0,255,65,0.1)"
          textAlign="center"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(0,255,65,0.03) 0px,
                rgba(0,255,65,0.03) 1px,
                transparent 1px,
                transparent 3px
              )
            `,
            backgroundSize: "100% 400%",
            animation: `${matrixRain} 8s linear infinite`,
            pointerEvents: "none",
          }}
          _after={{
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 4px)",
            pointerEvents: "none",
          }}
        >
          {visits === null ? (
            <Skeleton
              height="36px"
              startColor="#000400"
              endColor="#003300"
              borderRadius="2px"
              opacity={0.7}
            />
          ) : (
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="700"
              fontFamily="'Courier New', monospace"
              letterSpacing="3px"
              lineHeight="1"
              color="#00ff41"
              style={{
                animation: `${digitPulse} 3s ease-in-out infinite, ${flicker} 8s linear infinite`,
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
