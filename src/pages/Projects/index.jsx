import { Box } from "@chakra-ui/react";
import ProjectCard from "../../components/ProjectCard";
import {useIntl} from 'react-intl';

import { BsChevronDoubleUp } from "react-icons/bs";
import AnimatedStars from "../../components/AnimatedStars";
import { Link } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { useRef } from "react";
// import { projects } from "./projects";
import { motion, AnimatePresence } from "framer-motion";
import placas from "../../assets/img/placas.png";
import bio from "../../assets/img/bio.png";
import guia from "../../assets/img/guia.png";
import etica from "../../assets/img/etica.png";
import mestrado from "../../assets/img/mestrado.png";

const Projects = () => {
  const constraintsRef = useRef(null);
  const intl = useIntl();

  const projects = [
    {
      title: intl.formatMessage({id: 'project1t'}),
      link: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6772979792737296384?compact=1",
      demo: "https://presencenowreconhecimento.netlify.app/",
      description: intl.formatMessage({id: 'project1d'}),     
      tags: ["#REACT", "#NODE", "#FACEAPI.JS", "#RECONHECIMENTO FACIAL"],
      code: "https://github.com/brunokobi/tccreconhecimento",
    },

    {
      title: intl.formatMessage({id: 'project6t'}),
      link: "",
      img: mestrado,
      demo: "https://humane-neon-20a.notion.site/Mestrado-Computa-o-Aplicada-IFES-64a075f439f740c4be96345c615f97c9",
      description: intl.formatMessage({id: 'project6d'}),
      tags: ["#PYTHON","#MACHINE LEARNING","#ARTIFICIAL INTELLIGENCE"],
      code: "https://github.com/brunokobi",
    },

    {
      title: intl.formatMessage({id: 'project7t'}),
      link: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:6961453558051291136?compact=1",
      demo: "",
      description: intl.formatMessage({id: 'project7d'}),     
      tags: ["#JAVA","#MACHINE LEARNING","#ARTIFICIAL INTELLIGENCE"],
      code: "https://github.com/brunokobi",
    },
    
    {
      title: intl.formatMessage({id: 'project2t'}),
      link: "",
      img:guia,
      demo: "https://www.youtube.com/embed/8VxPXpS-qHg",
      description: intl.formatMessage({id: 'project2d'}),
      tags: ["#REACT NATIVE", "#EXPO", "#ANDROID", "#NUTRIÇÃO"],
      code: "https://play.google.com/store/apps/details?id=com.guiaalimentar.guiaalimentarbr",
    },
    
  
    {
      title: intl.formatMessage({id: 'project3t'}),
      link: "",
      img:etica,
      demo: "https://www.youtube.com/watch?v=euJuoEGtpnU&ab_channel=BrunoKobi",
      description: intl.formatMessage({id: 'project3d'}),
      tags: ["#JAVA", "#ANDROID", "#ÉTICA"],
      code: "https://github.com/brunokobi/QuizdaEtica",
    },
  
    {
      title: intl.formatMessage({id: 'project4t'}),
      link: "",
      img: placas,
      demo: "https://jogodasplacas.netlify.app/",
      description: intl.formatMessage({id: 'project4d'}),
      tags: ["#HTML5", "#CSS3", "#JAVASCRIPT"],
      code: "https://github.com/brunokobi/JogoMemoriaPlacas",
    },
  
    {
      title: intl.formatMessage({id: 'project5t'}),
      link: "",
      img: bio,
      demo: "https://biomedicina.netlify.app/",
      description: intl.formatMessage({id: 'project5d'}),
      tags: ["#REACT"],
      code: "https://github.com/brunokobi/biomedicina",
    },

  

  
   
  ];

  return (
    <AnimatePresence>
      <Box
        as={motion.div}
        ref={constraintsRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Box
          h="100vh"
          overflowY="auto"
          w="100%"
          overflowX="hidden"
          direction="column"
          align="center"
          position="relative"
          gap={5}
          pt={8}
          pb={24}
          scrollBehavior="smooth"
          as={motion.div}
          css={{
            "&::-webkit-scrollbar": {
              width: "5px",
              height: "10px",
            },
            "&::-webkit-scrollbar-track": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgb(196, 196, 196)",
              borderRadius: "24px",
            },
          }}
        >
          <Box
            position="relative"
            id="top"
            direction={{ base: "column", md: "row" }}
            px={6}
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
            initial="hidden"
            animate="visible"
          >
           
            {projects.map(
              ({ link, title, description, tags, demo, code, img }, i) => (
                <ProjectCard
                  key={i}
                  {...{ link, title, description, tags, demo, code, img, i }}
                />
              )
            )}
          </Box>
          <Box
            position="relative"
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
          >
            <Link href="#top">
              <Icon
                as={BsChevronDoubleUp}
                fontSize={24}
                my={1}
                color="#42c920"
              />
            </Link>
          </Box>
          <AnimatedStars />
        </Box>
      </Box>
    </AnimatePresence>
  );
};

export default Projects;
