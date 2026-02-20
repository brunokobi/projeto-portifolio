import { Flex } from "@chakra-ui/react";

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

const IconsLine = () => {
  const baseIcons = [    
    FaPhp,
    SiC,
    FaHtml5,
    FaCss3Alt,
    TbBrandJavascript,
    SiTypescript,
    FaReact,
    FaNodeJs,
    FaPython,
    FaJava,
    TbBrandVscode, 
    SiLatex,
    SiMysql,
    DiProlog,
    DiPostgresql,
    TbBrandSupabase,
    FaLaravel,
    SiN8N,       // Ícone oficial do n8n
    SiChatwoot,  // Ícone oficial do Chatwoot
    FaHeart,     // Coração representando o Lovable
    FaCube,      // Cubo do Three.js
    SiDocker,
    SiGithub
  ];

  const icons = [
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons,
    ...baseIcons
  ];

  return (
    <Flex
      w="100%"
      position="relative"
      fontSize={"6xl"}
      transform="rotate(-30deg)"     
      ml={-10}
      overflow="hidden"
    >
      <Flex>
        {icons.map((icon, i) => (
          <AnimatedIcon
            reactIcon={icons[Math.floor(Math.random() * icons.length)]}          
            key={i}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default IconsLine;