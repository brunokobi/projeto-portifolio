import { useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

import { 
  FaPhp, FaHtml5, FaNodeJs, FaPython, FaCss3Alt, 
  FaReact, FaJava, FaLaravel, FaCube, FaHeart 
} from "react-icons/fa";

import { TbBrandJavascript, TbBrandSupabase, TbBrandVscode } from "react-icons/tb";

// Adicionado SiN8N e SiChatwoot oficiais
import { 
  SiTypescript, SiC, SiLatex, SiMysql, SiDocker, SiGithub, SiN8N, SiChatwoot 
} from "react-icons/si";

import { DiProlog, DiPostgresql } from "react-icons/di";

import AnimatedIcon from "../../components/AnimatedIcon";

// 1. Movemos a base de ícones para FORA do componente
// Isso evita que o array seja recriado na memória a cada renderização.
const baseIcons = [    
  FaPhp, SiC, FaHtml5, FaCss3Alt, TbBrandJavascript,
  SiTypescript, FaReact, FaNodeJs, FaPython, FaJava,
  TbBrandVscode, SiLatex, SiMysql, DiProlog, DiPostgresql,
  TbBrandSupabase, FaLaravel, SiN8N, SiChatwoot, FaHeart,     
  FaCube, SiDocker, SiGithub
];

// 2. Criamos a animação de deslizamento contínuo (efeito Marquee)
const scrollAnimation = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const IconsLine = () => {
  const randomIcons = useMemo(() => {
    const halfCount = baseIcons.length * 5;
    const firstHalf = Array.from({ length: halfCount }).map(() => {
      return baseIcons[Math.floor(Math.random() * baseIcons.length)];
    });
    // Duplicamos a primeira metade para que o final da animação (-50%) 
    // seja idêntico ao começo (0%), criando um loop contínuo perfeito sem "pulos".
    return [...firstHalf, ...firstHalf];
  }, []);

  return (
    <Flex
      w="100%"
      position="relative"
      fontSize={"6xl"}
      transform="rotate(-30deg)"     
      ml={-10}
      overflow="hidden"
      // 1. Esconde a animação de leitores de tela para não poluir a navegação de deficientes visuais
      aria-hidden="true" 
      // 2. Cria um efeito de desfoque (fade) suave nas bordas direita e esquerda
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
      }}
    >
      <Flex
        // 3. Aplicamos a animação e permitimos que o container expanda
        animation={`${scrollAnimation} 60s linear infinite`}
        width="max-content"
        // Pausa a animação caso o usuário passe o mouse por cima (detalhe legal de UI)
        _hover={{
          animationPlayState: "paused"
        }}
      >
        {randomIcons.map((IconComponent, i) => (
          <AnimatedIcon
            reactIcon={IconComponent}          
            key={i}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default IconsLine;