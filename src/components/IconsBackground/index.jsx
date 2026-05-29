import { useEffect, useRef } from "react";
import { Box, Icon } from "@chakra-ui/react";

import {
  FaPhp, FaHtml5, FaNodeJs, FaPython, FaCss3Alt,
  FaReact, FaJava, FaLaravel, FaCube, FaHeart,
} from "react-icons/fa";
import { TbBrandJavascript, TbBrandSupabase, TbBrandVscode } from "react-icons/tb";
import {
  SiTypescript, SiC, SiLatex, SiMysql,
  SiDocker, SiGithub, SiN8N, SiChatwoot,
} from "react-icons/si";
import { DiProlog, DiPostgresql } from "react-icons/di";

import fundo from "../../assets/img/fundo.mp4";

const ALL_ICONS = [
  FaPhp, SiC, FaHtml5, FaCss3Alt, TbBrandJavascript,
  SiTypescript, FaReact, FaNodeJs, FaPython, FaJava,
  TbBrandVscode, SiLatex, SiMysql, DiProlog, DiPostgresql,
  TbBrandSupabase, FaLaravel, SiN8N, SiChatwoot, FaHeart,
  FaCube, SiDocker, SiGithub,
];

const STREAM_LENGTH = 9;    // ícones por coluna
const ICON_SPACING  = 58;   // px entre ícones na trilha
const COL_GAP       = 64;   // px entre colunas
const NUM_COLS      = 32;   // colunas (cobre telas largas)
const FALL_KF       = "matrix-icon-fall";

// Opacidade de topo (cauda) → base (cabeça) — cria o efeito de trilha
const TRAIL = [0.03, 0.07, 0.13, 0.22, 0.36, 0.54, 0.72, 0.88, 1.0];

const seededRng = (seed) => {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
};

// Configurações fixas — geradas uma vez fora do componente
const COLS = Array.from({ length: NUM_COLS }, (_, col) => {
  const rng   = seededRng(col * 1000033 + 7919);
  const speed = 8 + rng() * 10;                          // 8–18s por queda
  const delay = -(rng() * 18);                           // inicia em ponto aleatório da animação
  const size  = [28, 34, 40][Math.floor(rng() * 3)];    // 3 tamanhos de ícone
  const icons = Array.from({ length: STREAM_LENGTH }, () =>
    ALL_ICONS[Math.floor(rng() * ALL_ICONS.length)]
  );
  return { x: col * COL_GAP + 8, speed, delay, size, icons };
});

const IconsBackground = () => {
  const videoRef = useRef(null);

  // Injeta o keyframe CSS uma única vez
  useEffect(() => {
    const style = document.createElement("style");
    const startY = -(STREAM_LENGTH * ICON_SPACING + 40);
    style.textContent = `
      @keyframes ${FALL_KF} {
        from { transform: translateY(${startY}px); }
        to   { transform: translateY(110vh); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Garante reprodução do vídeo
  useEffect(() => {
    const v = videoRef.current;
    if (v) { v.muted = true; v.play().catch(() => {}); }
  }, []);

  return (
    <Box
      position="fixed"
      top={0} left={0} right={0} bottom={0}
      overflow="hidden"
      zIndex={0}
      pointerEvents="none"
    >
      {/* Vídeo de fundo */}
      <video
        ref={videoRef}
        autoPlay loop muted playsInline
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: 0.25,
        }}
      >
        <source src={fundo} type="video/mp4" />
      </video>

      {/* Overlay escuro para os ícones se destacarem */}
      <Box
        position="absolute"
        top={0} left={0} right={0} bottom={0}
        bg="rgba(0, 0, 0, 0.55)"
      />

      {/* Colunas Matrix com ícones caindo */}
      {COLS.map(({ x, speed, delay, size, icons }, col) => (
        <div
          key={col}
          style={{
            position: "absolute",
            left: x,
            top: 0,
            animationName: FALL_KF,
            animationDuration: `${speed}s`,
            animationDelay: `${delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        >
          {icons.map((IconComp, i) => {
            const isHead = i === STREAM_LENGTH - 1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: i * ICON_SPACING,
                  opacity: TRAIL[i],
                  color: isHead ? "#ccffdd" : "#42c920",
                  filter: isHead
                    ? "drop-shadow(0 0 10px #42c920) drop-shadow(0 0 4px #fff)"
                    : "none",
                  transition: "none",
                }}
              >
                <Icon as={IconComp} boxSize={`${size}px`} display="block" />
              </div>
            );
          })}
        </div>
      ))}
    </Box>
  );
};

export default IconsBackground;
