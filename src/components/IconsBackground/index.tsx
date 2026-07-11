import { useEffect, useState } from "react";
import { Box, Icon } from "@chakra-ui/react";

import {
  FaPhp,
  FaHtml5,
  FaNodeJs,
  FaPython,
  FaCss3Alt,
  FaReact,
  FaJava,
  FaLaravel,
  FaCube,
  FaHeart,
} from "react-icons/fa";
import { TbBrandJavascript, TbBrandSupabase, TbBrandVscode } from "react-icons/tb";
import {
  SiTypescript,
  SiC,
  SiLatex,
  SiMysql,
  SiDocker,
  SiGithub,
  SiN8N,
  SiChatwoot,
} from "react-icons/si";
import { DiProlog, DiPostgresql } from "react-icons/di";

const ALL_ICONS = [
  FaPhp, SiC, FaHtml5, FaCss3Alt, TbBrandJavascript, SiTypescript,
  FaReact, FaNodeJs, FaPython, FaJava, TbBrandVscode, SiLatex,
  SiMysql, DiProlog, DiPostgresql, TbBrandSupabase, FaLaravel,
  SiN8N, SiChatwoot, FaHeart, FaCube, SiDocker, SiGithub,
];

const STREAM_LENGTH = 7;
const ICON_SPACING = 92;
const COL_GAP = 88; // largura mínima desejada entre colunas
const FALL_KF = "matrix-icon-fall";
const TRAIL = [0.05, 0.12, 0.25, 0.44, 0.65, 0.84, 1.0];

const seededRng = (seed: number) => {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
};

const buildStream = (rng: () => number, colIndex: number) => {
  const result: (typeof ALL_ICONS)[number][] = [];
  const poolOffset = (colIndex * 5) % ALL_ICONS.length;
  for (let i = 0; i < STREAM_LENGTH; i++) {
    const last = result[result.length - 1];
    const secondLast = result[result.length - 2];
    const candidates = ALL_ICONS.filter((ic) => ic !== last && ic !== secondLast);
    const baseIdx = (poolOffset + i * 7) % candidates.length;
    const jitter = Math.floor(rng() * 4);
    result.push(candidates[(baseIdx + jitter) % candidates.length]);
  }
  return result;
};

interface ColConfig {
  xPercent: number;
  speed: number;
  delay: number;
  size: number;
  icons: (typeof ALL_ICONS)[number][];
}

const buildCols = (width: number): ColConfig[] => {
  const numCols = Math.max(4, Math.floor(width / COL_GAP));
  return Array.from({ length: numCols }, (_, col) => {
    const rng = seededRng(col * 1000033 + 7919);
    const speed = 11 + rng() * 9;
    const delay = -(rng() * 20);
    const size = [26, 32, 38][Math.floor(rng() * 3)];
    const icons = buildStream(rng, col);
    const xPercent = ((col + 0.5) / numCols) * 100;
    return { xPercent, speed, delay, size, icons };
  });
};

const IconsBackground = () => {
  const [cols, setCols] = useState<ColConfig[]>(() =>
    buildCols(typeof window !== "undefined" ? window.innerWidth : 1280)
  );

  useEffect(() => {
    const onResize = () => setCols(buildCols(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    const startY = -(STREAM_LENGTH * ICON_SPACING + 40);
    style.textContent = `
      @keyframes ${FALL_KF} {
        from { transform: translateX(-50%) translateY(${startY}px); }
        to   { transform: translateX(-50%) translateY(110vh); }
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
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      zIndex={1}
      pointerEvents="none"
    >
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0, 0, 0, 0.45)" />

      {cols.map(({ xPercent, speed, delay, size, icons }, col) => (
        <div
          key={col}
          style={{
            position: "absolute",
            left: `${xPercent}%`,
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
