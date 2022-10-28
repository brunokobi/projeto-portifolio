import { Box, keyframes } from "@chakra-ui/react";
import { motion } from "framer-motion";

import astro from "../../assets/img/astro.png";

const Astro = ({ wrapper }) => {
  const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

  const animation = `${spin} infinite 10s linear`;

  return (
    <Box
      as={motion.div}
      drag
      dragConstraints={wrapper}
      p={1}
      marginX="500px"
      marginY="500px"
      position="fixed"
      zIndex={99999}
    >
      <Box
        style={{
          backgroundImage: `url(${astro})`,
          backgroundSize: "cover",
        }}
        w={{ base: "75px", md: "100px" }}
        h={{ base: "75px", md: "100px" }}
        animation={animation}
      ></Box>
    </Box>
  );
};

export default Astro;
