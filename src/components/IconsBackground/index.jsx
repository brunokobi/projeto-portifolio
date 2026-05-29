import { useEffect, useRef } from "react";
import { Box, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";

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

// Ângulo de ouro — distribui 40 direções de forma uniforme ao redor de 360°
const GOLDEN_ANGLE = 2.399963229728653;

const ICONS_CONFIG = Array.from({ length: 40 }, (_, i) => {
  const angle = i * GOLDEN_ANGLE;
  const speed = 4 + (i % 5) * 0.9;            // 4s a ~7.6s por ciclo
  const delay = (i * 0.618) % 5;              // delays escalonados 0~5s
  const size  = 42 + (i % 4) * 14;            // 42 a 84px base
  const icon  = ALL_ICONS[i % ALL_ICONS.length];
  const tx    = Math.cos(angle) * 1300;        // destino X (px)
  const ty    = Math.sin(angle) * 850;         // destino Y (px)
  return { speed, delay, size, icon, tx, ty };
});

const FlyingIcon = ({ icon: IconComp, speed, delay, size, tx, ty }) => (
  <motion.div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      marginLeft: `-${size / 2}px`,
      marginTop: `-${size / 2}px`,
      pointerEvents: "none",
      willChange: "transform, opacity",
    }}
    animate={{
      x:       [0, tx],
      y:       [0, ty],
      scale:   [0.25, 10],
      opacity: [0, 0.9, 0.85, 0],
    }}
    transition={{
      duration: speed,
      delay,
      repeat: Infinity,
      ease: "linear",
      opacity: {
        times: [0, 0.06, 0.70, 1],
        ease: "linear",
      },
    }}
  >
    <Icon
      as={IconComp}
      boxSize={`${size}px`}
      color="#42c920"
      display="block"
    />
  </motion.div>
);

const IconsBackground = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
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
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      >
        <source src={fundo} type="video/mp4" />
      </video>

      {/* Ícones voando do centro para as bordas */}
      {ICONS_CONFIG.map((config, i) => (
        <FlyingIcon key={i} {...config} />
      ))}
    </Box>
  );
};

export default IconsBackground;
