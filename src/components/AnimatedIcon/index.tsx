import { Box, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";

const AnimatedIcon = ({ reactIcon }) => {
  return (
    <Box color="rgba(255,255,255,0.08)" as={motion.div} userSelect="none">
      <Icon
        as={reactIcon}
        transition="1s"
        p="0 5px"
        _hover={{
          color: "#42c920",
          transition: "0.2s",         
          filter: "drop-shadow(-3px -3px 15px #42c920)",
          animation: "spin 0.2s linear",
                   
        }}
      />
    </Box>
  );
};

export default AnimatedIcon;

// #42c920
