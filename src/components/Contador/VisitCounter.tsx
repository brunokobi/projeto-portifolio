import { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { createClient } from "@supabase/supabase-js";
import { useIntl } from "react-intl";
import falar from "../TextAudio";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ── Animações ─────────────────────────────────────────────────────────────

const floatAnim = keyframes`
  0%   { transform: translateY(0px)   rotate(-0.8deg); }
  30%  { transform: translateY(-7px)  rotate(0.6deg);  }
  65%  { transform: translateY(-3px)  rotate(-0.4deg); }
  100% { transform: translateY(0px)   rotate(-0.8deg); }
`;

const rimBlink = keyframes`
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.2; }
`;

const beamPulse = keyframes`
  0%,100% { opacity: 0;    transform: translateX(-50%) scaleX(0.85); }
  50%      { opacity: 0.45; transform: translateX(-50%) scaleX(1);    }
`;

const domeGlow = keyframes`
  0%,100% { box-shadow: inset 0 4px 12px rgba(0,200,255,0.12), inset 2px 3px 8px rgba(255,255,255,0.06); }
  50%      { box-shadow: inset 0 4px 16px rgba(0,220,255,0.22), inset 2px 3px 8px rgba(255,255,255,0.1);  }
`;

// ── Digit tile (flip-clock) ────────────────────────────────────────────────

const DigitTile = ({ digit }: { digit: string }) => (
  <Box
    position="relative"
    w="20px"
    h="26px"
    borderRadius="3px"
    overflow="hidden"
    flexShrink={0}
    boxShadow="0 2px 5px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.95)"
    border="1px solid #999"
  >
    {/* Top half — brighter */}
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      h="50%"
      bg="linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)"
      display="flex"
      alignItems="flex-end"
      justifyContent="center"
      pb="0px"
    >
      <Text
        fontFamily="'Courier New', 'Roboto Mono', monospace"
        fontWeight="900"
        fontSize="15px"
        lineHeight="1"
        color="#1a1a2e"
        style={{ fontVariantNumeric: "tabular-nums", userSelect: "none" }}
      >
        {digit}
      </Text>
    </Box>

    {/* Middle divider */}
    <Box
      position="absolute"
      top="50%"
      left={0}
      right={0}
      h="1.5px"
      bg="#666"
      zIndex={3}
      style={{ transform: "translateY(-50%)" }}
    />

    {/* Bottom half — slightly darker */}
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      h="50%"
      bg="linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%)"
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      pt="0px"
      overflow="hidden"
    >
      <Text
        fontFamily="'Courier New', 'Roboto Mono', monospace"
        fontWeight="900"
        fontSize="15px"
        lineHeight="1"
        color="#1a1a2e"
        style={{
          fontVariantNumeric: "tabular-nums",
          userSelect: "none",
          marginTop: "-13px",
        }}
      >
        {digit}
      </Text>
    </Box>
  </Box>
);

// ── Rim light ──────────────────────────────────────────────────────────────

const LIGHTS = ["#42c920", "#00d4ff", "#ffaa00", "#ff4488", "#42c920", "#00d4ff", "#ffaa00"];

// ── Componente principal ───────────────────────────────────────────────────

const VisitCounter = () => {
  const [visits, setVisits] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
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

  const digits = String(visits ?? 0)
    .padStart(4, "0")
    .split("");

  return (
    <Box
      position="fixed"
      top={{ base: "12px", md: "20px" }}
      left={{ base: "12px", md: "20px" }}
      zIndex={100}
      onMouseEnter={() => {
        setHovered(true);
        if (visits !== null) falar(`${visits} ${label}`);
      }}
      onMouseLeave={() => setHovered(false)}
      // área de toque generosa para mobile
      p="4px"
      cursor="default"
    >
      {/* Tractor beam — aparece no hover */}
      <Box
        position="absolute"
        bottom="-22px"
        left="50%"
        w="90px"
        h="26px"
        pointerEvents="none"
        style={{
          transform: "translateX(-50%)",
          background:
            "linear-gradient(180deg, rgba(66,201,32,0.5) 0%, rgba(66,201,32,0.08) 80%, transparent 100%)",
          clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
          animation: hovered ? `${beamPulse} 0.9s ease-in-out infinite` : "none",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* UFO flutuando */}
      <Box
        position="relative"
        w="168px"
        style={{
          animation: `${floatAnim} 3.8s ease-in-out infinite`,
          filter: hovered
            ? "drop-shadow(0 0 14px rgba(66,201,32,0.7)) drop-shadow(0 6px 16px rgba(0,0,0,0.6))"
            : "drop-shadow(0 6px 14px rgba(0,0,0,0.55))",
          transition: "filter 0.35s ease, transform 0.35s ease",
          transform: hovered ? "scale(1.07)" : "scale(1)",
        }}
      >
        {/* ── DOMO ──────────────────────────────────────────────── */}
        <Box
          position="absolute"
          top="-30px"
          left="50%"
          w="70px"
          h="36px"
          zIndex={4}
          style={{
            transform: "translateX(-50%)",
            background:
              "linear-gradient(155deg, #1e3040 0%, #0d1f2d 45%, #1a3048 100%)",
            borderRadius: "50% 50% 0 0",
            animation: `${domeGlow} 3s ease-in-out infinite`,
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
          }}
        >
          {/* Reflexo do domo */}
          <Box
            position="absolute"
            top="7px"
            left="13px"
            w="16px"
            h="8px"
            borderRadius="50%"
            bg="rgba(140,230,255,0.18)"
            style={{ transform: "rotate(-22deg)" }}
          />
          <Box
            position="absolute"
            top="5px"
            right="16px"
            w="6px"
            h="6px"
            borderRadius="50%"
            bg="rgba(140,230,255,0.10)"
          />
        </Box>

        {/* ── DISCO PRINCIPAL ───────────────────────────────────── */}
        <Box
          position="relative"
          w="168px"
          h="62px"
          zIndex={3}
          style={{
            background:
              "linear-gradient(180deg, #e2e6ea 0%, #b8bfc8 25%, #909aa4 52%, #bcc2ca 78%, #d4d9df 100%)",
            borderRadius: "50%",
            boxShadow: hovered
              ? "0 5px 24px rgba(0,0,0,0.65), inset 0 2px 5px rgba(255,255,255,0.55), inset 0 -3px 8px rgba(0,0,0,0.35), 0 0 22px rgba(66,201,32,0.35)"
              : "0 5px 18px rgba(0,0,0,0.65), inset 0 2px 5px rgba(255,255,255,0.55), inset 0 -3px 8px rgba(0,0,0,0.35)",
            transition: "box-shadow 0.35s ease",
          }}
        >
          {/* Brilho superior do aro */}
          <Box
            position="absolute"
            top="5px"
            left="14px"
            right="14px"
            h="4px"
            borderRadius="50%"
            bg="rgba(255,255,255,0.55)"
            style={{ filter: "blur(1px)" }}
          />

          {/* ── Display: label + dígitos ── */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="3px"
            style={{ transform: "translate(-50%, -56%)" }}
          >
            <Text
              fontSize="7px"
              fontFamily="'Courier New', monospace"
              fontWeight="700"
              color="#2a2d35"
              letterSpacing="0.18em"
              textTransform="uppercase"
              lineHeight="1"
              opacity={0.65}
            >
              {label}
            </Text>

            <Box display="flex" gap="3px">
              {visits === null
                ? [0, 1, 2, 3].map((i) => <DigitTile key={i} digit="-" />)
                : digits.map((d, i) => <DigitTile key={i} digit={d} />)}
            </Box>
          </Box>

          {/* ── Luzes do aro ── */}
          <Box
            position="absolute"
            bottom="9px"
            left="50%"
            display="flex"
            alignItems="center"
            gap="7px"
            style={{ transform: "translateX(-50%)" }}
          >
            {LIGHTS.map((color, i) => (
              <Box
                key={i}
                w="5px"
                h="5px"
                borderRadius="full"
                bg={color}
                style={{
                  boxShadow: `0 0 5px ${color}, 0 0 9px ${color}88`,
                  animation: `${rimBlink} ${1.1 + i * 0.18}s ease-in-out infinite`,
                  animationDelay: `${i * 0.22}s`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Sombra ventral (underside glow) */}
        <Box
          position="absolute"
          bottom="-6px"
          left="20px"
          right="20px"
          h="8px"
          borderRadius="50%"
          bg={hovered ? "rgba(66,201,32,0.22)" : "rgba(0,0,0,0.3)"}
          style={{ filter: "blur(6px)", transition: "background 0.35s ease" }}
        />
      </Box>
    </Box>
  );
};

export default VisitCounter;
