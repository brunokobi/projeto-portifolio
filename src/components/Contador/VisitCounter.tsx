import { useEffect, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { createClient } from "@supabase/supabase-js";
import { useIntl } from "react-intl";
import falar from "../TextAudio";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const floatAnim = keyframes`
  0%   { transform: translateY(0px)   rotate(-0.8deg); }
  30%  { transform: translateY(-8px)  rotate(0.6deg);  }
  65%  { transform: translateY(-4px)  rotate(-0.4deg); }
  100% { transform: translateY(0px)   rotate(-0.8deg); }
`;

const rimBlink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.15; }
`;

const beamPulse = keyframes`
  0%,100% { opacity: 0;    transform: translateX(-50%) scaleX(0.85); }
  50%      { opacity: 0.55; transform: translateX(-50%) scaleX(1);    }
`;

const domeGlow = keyframes`
  0%,100% { box-shadow: 0 -5px 14px rgba(0,160,255,0.22), inset 0 4px 14px rgba(100,200,255,0.10); }
  50%      { box-shadow: 0 -5px 22px rgba(0,190,255,0.4),  inset 0 4px 18px rgba(130,220,255,0.18); }
`;

const scanLine = keyframes`
  0%   { top: 8%;  opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 78%; opacity: 0; }
`;

// ── Flip-clock digit tile ──────────────────────────────────────────────────
const DigitTile = ({ digit }: { digit: string }) => (
  <Box
    position="relative"
    w="17px"
    h="23px"
    borderRadius="2px"
    overflow="hidden"
    flexShrink={0}
    boxShadow="0 2px 5px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.9)"
    border="1px solid #777"
  >
    <Box
      position="absolute" top={0} left={0} right={0} h="50%"
      bg="linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%)"
      display="flex" alignItems="flex-end" justifyContent="center"
    >
      <Text
        fontFamily="'Courier New', 'Roboto Mono', monospace"
        fontWeight="900" fontSize="13px" lineHeight="1" color="#111"
        style={{ fontVariantNumeric: "tabular-nums", userSelect: "none" }}
      >
        {digit}
      </Text>
    </Box>
    <Box
      position="absolute" top="50%" left={0} right={0}
      h="1px" bg="#444" zIndex={3}
      style={{ transform: "translateY(-50%)" }}
    />
    <Box
      position="absolute" bottom={0} left={0} right={0} h="50%"
      bg="linear-gradient(180deg, #d8d8d8 0%, #c8c8c8 100%)"
      display="flex" alignItems="flex-start" justifyContent="center"
      overflow="hidden"
    >
      <Text
        fontFamily="'Courier New', 'Roboto Mono', monospace"
        fontWeight="900" fontSize="13px" lineHeight="1" color="#111"
        style={{ fontVariantNumeric: "tabular-nums", userSelect: "none", marginTop: "-11px" }}
      >
        {digit}
      </Text>
    </Box>
  </Box>
);

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

  const digits = String(visits ?? 0).padStart(4, "0").split("");

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
      p="4px"
      cursor="default"
    >
      {/* Tractor beam */}
      <Box
        position="absolute"
        bottom="-30px"
        left="50%"
        w="110px"
        h="34px"
        pointerEvents="none"
        style={{
          transform: "translateX(-50%)",
          background:
            "linear-gradient(180deg, rgba(66,201,32,0.6) 0%, rgba(66,201,32,0.06) 85%, transparent 100%)",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)",
          animation: hovered ? `${beamPulse} 0.9s ease-in-out infinite` : "none",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* UFO flutuando */}
      <Box
        position="relative"
        w="190px"
        style={{
          animation: `${floatAnim} 3.8s ease-in-out infinite`,
          filter: hovered
            ? "drop-shadow(0 0 16px rgba(66,201,32,0.75)) drop-shadow(0 8px 20px rgba(0,0,0,0.65))"
            : "drop-shadow(0 7px 16px rgba(0,0,0,0.6))",
          transition: "filter 0.35s ease, transform 0.35s ease",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }}
      >
        {/* ── DOMO ─ vidro azul visível ──────────────────────────────── */}
        <Box
          position="absolute"
          top="-38px"
          left="50%"
          w="80px"
          h="42px"
          zIndex={4}
          overflow="hidden"
          style={{
            transform: "translateX(-50%)",
            background:
              "linear-gradient(155deg, rgba(55,110,200,0.88) 0%, rgba(20,60,130,0.93) 50%, rgba(35,80,165,0.88) 100%)",
            borderRadius: "50% 50% 0 0",
            border: "1.5px solid rgba(120,200,255,0.5)",
            borderBottom: "none",
            animation: `${domeGlow} 3s ease-in-out infinite`,
          }}
        >
          {/* Scan line */}
          <Box
            position="absolute"
            left="8%"
            right="8%"
            h="2px"
            bg="rgba(160,230,255,0.25)"
            style={{ animation: `${scanLine} 2.4s linear infinite` }}
          />
          {/* Reflexos */}
          <Box
            position="absolute" top="9px" left="15px"
            w="20px" h="10px" borderRadius="50%"
            bg="rgba(190,240,255,0.26)"
            style={{ transform: "rotate(-22deg)" }}
          />
          <Box
            position="absolute" top="7px" right="14px"
            w="9px" h="8px" borderRadius="50%"
            bg="rgba(190,240,255,0.14)"
          />
        </Box>

        {/* ── DISCO PRINCIPAL ───────────────────────────────────────── */}
        <Box
          position="relative"
          w="190px"
          h="74px"
          zIndex={3}
          style={{
            background:
              "linear-gradient(180deg, #eaeff4 0%, #c4ccd8 20%, #8c98a8 50%, #bec6d0 78%, #dce1e8 100%)",
            borderRadius: "50%",
            boxShadow: hovered
              ? "0 6px 28px rgba(0,0,0,0.72), inset 0 2px 6px rgba(255,255,255,0.65), inset 0 -3px 9px rgba(0,0,0,0.4), 0 0 26px rgba(66,201,32,0.42)"
              : "0 6px 22px rgba(0,0,0,0.72), inset 0 2px 6px rgba(255,255,255,0.65), inset 0 -3px 9px rgba(0,0,0,0.4)",
            transition: "box-shadow 0.35s ease",
          }}
        >
          {/* Brilho superior do aro */}
          <Box
            position="absolute" top="6px" left="18px" right="18px"
            h="5px" borderRadius="50%"
            bg="rgba(255,255,255,0.65)"
            style={{ filter: "blur(1.5px)" }}
          />

          {/* ── Painel LCD embutido ── */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            w="118px"
            h="48px"
            borderRadius="5px"
            style={{
              transform: "translate(-50%, -55%)",
              background: "rgba(6,14,6,0.94)",
              border: "1px solid rgba(66,201,32,0.55)",
              boxShadow:
                "inset 0 2px 6px rgba(0,0,0,0.85), 0 0 10px rgba(66,201,32,0.18)",
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              h="100%"
              gap="4px"
            >
              <Text
                fontSize="6px"
                fontFamily="'Courier New', monospace"
                fontWeight="700"
                color="rgba(66,201,32,0.72)"
                letterSpacing="0.22em"
                textTransform="uppercase"
                lineHeight="1"
              >
                {label}
              </Text>
              <Box display="flex" gap="3px">
                {visits === null
                  ? [0, 1, 2, 3].map((i) => <DigitTile key={i} digit="-" />)
                  : digits.map((d, i) => <DigitTile key={i} digit={d} />)}
              </Box>
            </Box>
          </Box>

          {/* ── Luzes do aro ── */}
          <Box
            position="absolute"
            bottom="11px"
            left="50%"
            display="flex"
            alignItems="center"
            gap="8px"
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
                  boxShadow: `0 0 5px ${color}, 0 0 10px ${color}88`,
                  animation: `${rimBlink} ${1.1 + i * 0.18}s ease-in-out infinite`,
                  animationDelay: `${i * 0.22}s`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Sombra ventral */}
        <Box
          position="absolute"
          bottom="-7px"
          left="26px"
          right="26px"
          h="9px"
          borderRadius="50%"
          bg={hovered ? "rgba(66,201,32,0.28)" : "rgba(0,0,0,0.38)"}
          style={{ filter: "blur(7px)", transition: "background 0.35s ease" }}
        />
      </Box>
    </Box>
  );
};

export default VisitCounter;
