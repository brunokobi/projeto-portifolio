import { useEffect, useMemo, useRef } from "react";
import { Box, Icon } from "@chakra-ui/react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import {
  FaPhp, FaHtml5, FaNodeJs, FaPython, FaCss3Alt,
  FaReact, FaJava, FaLaravel, FaCube, FaHeart,
} from "react-icons/fa";
import { TbBrandJavascript, TbBrandSupabase, TbBrandVscode } from "react-icons/tb";
import { SiTypescript, SiC, SiLatex, SiMysql, SiDocker, SiGithub, SiN8N, SiChatwoot } from "react-icons/si";
import { DiProlog, DiPostgresql } from "react-icons/di";

import fundo from "../../assets/img/fundo.mp4";

const ALL_ICONS = [
  FaPhp, SiC, FaHtml5, FaCss3Alt, TbBrandJavascript,
  SiTypescript, FaReact, FaNodeJs, FaPython, FaJava,
  TbBrandVscode, SiLatex, SiMysql, DiProlog, DiPostgresql,
  TbBrandSupabase, FaLaravel, SiN8N, SiChatwoot, FaHeart,
  FaCube, SiDocker, SiGithub,
];

// Posições fixas e determinísticas — não re-randomizam a cada render
function seededPositions(count, seed) {
  let s = seed;
  const next = () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    top:  next() * 88 + 4,
    left: next() * 88 + 4,
    icon: ALL_ICONS[Math.floor(next() * ALL_ICONS.length)],
  }));
}

// Camada traseira: move pouco, ícones pequenos e bem transparentes
// Camada média: velocidade e tamanho intermediários
// Camada frontal: move mais, ícones maiores e mais visíveis
const LAYERS = [
  { depth: 0.012, size: 28, opacity: 0.045, count: 18, seed: 11 },
  { depth: 0.032, size: 44, opacity: 0.07,  count: 14, seed: 22 },
  { depth: 0.065, size: 62, opacity: 0.10,  count: 8,  seed: 33 },
];

const SPRING = { stiffness: 55, damping: 18, mass: 0.8 };

const ParallaxLayer = ({ mouseX, mouseY, depth, size, opacity, icons }) => {
  const x = useSpring(useTransform(mouseX, (v) => v * depth), SPRING);
  const y = useSpring(useTransform(mouseY, (v) => v * depth), SPRING);

  return (
    <motion.div
      style={{
        x, y,
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none",
      }}
    >
      {icons.map(({ top, left, icon: IconComp }, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: `${top}%`,
            left: `${left}%`,
            color: `rgba(66, 201, 32, ${opacity})`,
            pointerEvents: "auto",
            cursor: "default",
            display: "inline-block",
          }}
          whileHover={{
            scale: 1.6,
            color: "#42c920",
            filter: "drop-shadow(0 0 16px #42c920)",
          }}
          transition={{ duration: 0.18 }}
        >
          <Icon as={IconComp} boxSize={`${size}px`} display="block" />
        </motion.div>
      ))}
    </motion.div>
  );
};

const IconsBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }, []);

  const layers = useMemo(
    () => LAYERS.map((l) => ({ ...l, icons: seededPositions(l.count, l.seed) })),
    []
  );

  return (
    <Box
      position="fixed"
      top={0} left={0} right={0} bottom={0}
      overflow="hidden"
      zIndex={0}
      pointerEvents="none"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      >
        <source src={fundo} type="video/mp4" />
      </video>

      <Box position="absolute" top={0} left={0} right={0} bottom={0}>
        {layers.map((layer, i) => (
          <ParallaxLayer key={i} mouseX={mouseX} mouseY={mouseY} {...layer} />
        ))}
      </Box>
    </Box>
  );
};

export default IconsBackground;
