import { FaReact } from "react-icons/fa";
import { AiOutlineLinkedin } from "react-icons/ai";
import { AiOutlineGithub } from "react-icons/ai";
import { AiOutlineInstagram } from "react-icons/ai";
import { AiOutlineFacebook } from "react-icons/ai";
import { RiAliensFill } from "react-icons/ri";
import { IoMdRocket } from "react-icons/io";


export const sections = [
  {
    label: "Home",
    url: "/",
    icon: IoMdRocket,
  },
  {
    label: "Sobre",
    url: "/about",
    icon: RiAliensFill,
  },

  {
    label: "Projetos",
    url: "/projects",
    icon: FaReact,
  },   
  {
    label: "Linkedin",
    url: "https://www.linkedin.com/in/brunokobi/",
    icon: AiOutlineLinkedin,
  },
  {
    label: "Github",
    url: "https://github.com/brunokobi",
    icon: AiOutlineGithub,
  }, 
  {
    label: "Instagram",
    url: "https://www.instagram.com/brunokobi/",
    icon: AiOutlineInstagram,
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/bruno.kobi/",
    icon: AiOutlineFacebook,
  },
      

];
