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

const STREAM_LENGTH = 7;    // ícones por coluna (menos denso)
const ICON_SPACING  = 92;   // px entre ícones — mais espaçado
const COL_GAP       = 88;   // px entre colunas
const NUM_COLS      = 18;
const FALL_KF       = "matrix-icon-fall";

// Opacidade cauda→cabeça para STREAM_LENGTH = 7
const TRAIL = [0.05, 0.12, 0.25, 0.44, 0.65, 0.84, 1.0];

const seededRng = (seed) => {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
};

// Gera stream garantindo: sem ícone igual adjacente e distribuição
// diferente por coluna (offset = col * 5 percorre o array de forma única)
const buildStream = (rng, colIndex) => {
  const result = [];
  const poolOffset = (colIndex * 5) % ALL_ICONS.length;

  for (let i = 0; i < STREAM_LENGTH; i++) {
    const last       = result[result.length - 1];
    const secondLast = result[result.length - 2];

    // Remove último e penúltimo para evitar repetição adjacente e vizinha
    const candidates = ALL_ICONS.filter(ic => ic !== last && ic !== secondLast);

    // Base determinística por coluna + pequena variação aleatória
    const baseIdx = (poolOffset + i * 7) % candidates.length;
    const jitter  = Math.floor(rng() * 4);
    result.push(candidates[(baseIdx + jitter) % candidates.length]);
  }
  return result;
};

// Configurações fixas — geradas uma vez fora do componente
const COLS = Array.from({ length: NUM_COLS }, (_, col) => {
  const rng   = seededRng(col * 1000033 + 7919);
  const speed = 11 + rng() * 9;                          // 11–20s por queda
  const delay = -(rng() * 20);
  const size  = [26, 32, 38][Math.floor(rng() * 3)];
  const icons = buildStream(rng, col);
  return { x: col * COL_GAP + 8, speed, delay, size, icons };
});

const IconsBackground = () => {
  const videoRef = useRef(null);

  // Injeta o keyframe e as regras de hover uma única vez
  useEffect(() => {
    const style = document.createElement("style");
    const startY = -(STREAM_LENGTH * ICON_SPACING + 40);
    style.textContent = `
      @keyframes ${FALL_KF} {
        from { transform: translateY(${startY}px); }
        to   { transform: translateY(110vh); }
      }
      .matrix-icon {
        pointer-events: auto;
        cursor: default;
        transition: opacity 0.25s ease, filter 0.25s ease, color 0.25s ease;
      }
      .matrix-icon:hover {
        opacity: 1 !important;
        color: #ffffff !important;
        filter: drop-shadow(0 0 14px #42c920) drop-shadow(0 0 6px #fff) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Adia o carregamento do vídeo para não bloquear o primeiro render
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const timer = setTimeout(() => {
      v.muted = true;
      v.src = v.querySelector("source").src;
      v.load();
      v.play().catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
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
        autoPlay loop muted playsInline preload="none"
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
                className="matrix-icon"
                style={{
                  position: "absolute",
                  top: i * ICON_SPACING,
                  opacity: TRAIL[i] * 0.5,
                  color: isHead ? "#ccffdd" : "#42c920",
                  filter: isHead
                    ? "drop-shadow(0 0 10px #42c920) drop-shadow(0 0 4px #fff)"
                    : "none",
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
