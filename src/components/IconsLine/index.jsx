import { Flex } from "@chakra-ui/react";
import { FaPhp } from "react-icons/fa";
import { FaHtml5 } from "react-icons/fa";
import { FaNodeJs } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb"
import { FaPython } from "react-icons/fa";
import { FaCss3Alt } from "react-icons/fa";
import { FaReact } from "react-icons/fa";
import { FaJava } from "react-icons/fa";
import { SiTypescript } from "react-icons/si";
import { SiC } from "react-icons/si";
import { SiVisualstudiocode } from "react-icons/si";
import { SiLatex } from "react-icons/si";
import { SiMysql } from "react-icons/si";
import { DiProlog } from "react-icons/di";
import { DiPostgresql } from "react-icons/di";



import AnimatedIcon from "../../components/AnimatedIcon";

const IconsLine = () => {
  const icons = [    
    FaPhp,
    SiC ,
    FaHtml5,
    FaCss3Alt,
    TbBrandJavascript,
    SiTypescript,
    FaReact,
    FaNodeJs,
    FaPython,
    FaJava,
    SiVisualstudiocode,
    SiLatex,
    SiMysql,
    DiProlog,
    DiPostgresql,
    FaPhp,
    SiC ,
    FaHtml5,
    FaCss3Alt,
    TbBrandJavascript,
    SiTypescript,
    FaReact,
    FaNodeJs,
    FaPython,
    FaJava,
    SiVisualstudiocode,
    SiLatex,
    SiMysql,
    DiProlog,
    DiPostgresql,
    FaPhp,
    SiC ,
    FaHtml5,
    FaCss3Alt,
    TbBrandJavascript,
    SiTypescript,
    FaReact,
    FaNodeJs,
    FaPython,
    FaJava,
    SiVisualstudiocode,
    SiLatex,
    SiMysql,
    DiProlog,
    DiPostgresql,
    FaPhp,
    SiC ,
    FaHtml5,
    FaCss3Alt,
    TbBrandJavascript,
    SiTypescript,
    FaReact,
    FaNodeJs,
    FaPython,
    FaJava,
    SiVisualstudiocode,
    SiLatex,
    SiMysql,
    DiProlog,
    DiPostgresql,       
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
            reactIcon={icons[Math.floor(Math.random() * 20)]}
            // reactIcon={icon}
            key={i}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default IconsLine;
