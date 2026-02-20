import { IoLogoJavascript, IoLogoHtml5, IoLogoCss3, IoLogoReact, IoLogoNodejs } from "react-icons/io5";

import { 
  SiPhp, 
  SiMysql, 
  SiTypescript, 
  SiC, 
  SiLatex, 
  SiSupabase, 
  SiLaravel, 
  SiDocker, 
  SiGithub,
  SiChatwoot, // Ícone oficial do Chatwoot
  SiN8N       // Ícone oficial do n8n
} from "react-icons/si";

import { TbBrandVscode } from "react-icons/tb";

import { FaPython, FaCube, FaHeart } from "react-icons/fa"; // FaHeart adicionado para o Lovable

import { DiProlog, DiPostgresql } from "react-icons/di";

export const skills = [
  {
    label: "HTML",
    icon: IoLogoHtml5,
  },
  {
    label: "CSS",
    icon: IoLogoCss3,
  },
  {
    label: "JavaScript",
    icon: IoLogoJavascript,
  },
  {
    label: "TypeScript",
    icon: SiTypescript,
  },   
  {
    label: "Python",
    icon: FaPython,
  },
  {
    label: "React.js",
    icon: IoLogoReact,
  },  
  {
    label: "Three.js",
    icon: FaCube, 
  },
  {
    label: "Node.js",
    icon: IoLogoNodejs,
  },
  {
    label: "PHP",
    icon: SiPhp,
  },
  {
    label: "Laravel",
    icon: SiLaravel,
  },
  {
    label: "PostgreSQL",
    icon: DiPostgresql,
  }, 
  {
    label: "MySQL",
    icon: SiMysql,
  },
  {
    label: "Supabase",
    icon: SiSupabase,
  },
  {
    label: "n8n",
    icon: SiN8N, // Usando o oficial
  },
  {
    label: "Chatwoot",
    icon: SiChatwoot, // Usando o oficial
  },
  {
    label: "Lovable",
    icon: FaHeart, // Coração adicionado!
  },
  {
    label: "Docker",
    icon: SiDocker,
  },
  {
    label: "GitHub",
    icon: SiGithub,
  },
  {
    label: "C",
    icon: SiC,
  }, 
  {
    label: "Prolog",
    icon: DiProlog,
  }, 
  {
    label: "LaTeX",
    icon: SiLatex,
  },  
  {
    label: "VS Code",
    icon: TbBrandVscode, 
  },  
];