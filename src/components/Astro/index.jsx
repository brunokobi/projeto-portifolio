import { Box, keyframes } from "@chakra-ui/react";
import { motion } from "framer-motion";

import astro from "../../assets/img/astro.png";

const Astro = ({ wrapper }) => {
  const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

  const animation = `${spin} infinite 30s linear`;

  return (
    <Box
      as={motion.div}
      drag
      dragConstraints={wrapper}
      p={12}
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
