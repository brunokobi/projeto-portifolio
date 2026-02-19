import { IoLogoJavascript } from "react-icons/io5";
import { IoLogoHtml5 } from "react-icons/io5";
import { IoLogoCss3 } from "react-icons/io5";
import { IoLogoReact } from "react-icons/io5";
import { IoLogoNodejs } from "react-icons/io5";

import { SiPhp } from "react-icons/si";
import { SiMysql } from "react-icons/si";
import { SiTypescript } from "react-icons/si";
import { SiC } from "react-icons/si";
import { SiVisualstudiocode } from "react-icons/si";
import { SiLatex } from "react-icons/si";
import { SiSupabase } from "react-icons/si";
import { SiLaravel } from "react-icons/si";
import { SiDocker } from "react-icons/si";
import { SiGithub } from "react-icons/si";

// Substitutos para contornar o erro de versão do react-icons
import { FaPython, FaCode, FaCogs, FaCube } from "react-icons/fa"; // FaCogs para n8n, FaCube para Three.js, FaCode para Lovable
import { BsChatDots } from "react-icons/bs"; // Para Chatwoot
import { MdOutlineElectricalServices } from "react-icons/md"; // Alternativa visual para Livewire

import { DiProlog } from "react-icons/di";
import { DiPostgresql } from "react-icons/di";

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
    icon: FaCube, // Trocado para evitar erro
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
    label: "Livewire",
    icon: MdOutlineElectricalServices, // Trocado para evitar erro
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
    icon: FaCogs, // Trocado para evitar erro
  },
  {
    label: "Chatwoot",
    icon: BsChatDots,
  },
  {
    label: "Lovable",
    icon: FaCode,
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
    icon: SiVisualstudiocode,
  },  
];