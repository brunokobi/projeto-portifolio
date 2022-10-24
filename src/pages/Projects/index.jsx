import { Box } from "@chakra-ui/react";
import ProjectCard from "../../components/ProjectCard";
import Astro from "../../components/Astro";

import { BsChevronDoubleUp } from "react-icons/bs";
import AnimatedStars from "../../components/AnimatedStars";
import { Link } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/react";
import { useRef } from "react";
import { projects } from "./projects";
import { motion, AnimatePresence } from "framer-motion";

const Projects = () => {
  const constraintsRef = useRef(null);

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
            <Astro wrapper={constraintsRef} />
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
