import { Box, Flex, Stack } from "@chakra-ui/react";

import IconsLine from "../IconsLine";
import fundo from "../../assets/img/fundo.mp4"; // agradecimento Vittorio Cazzadore video 

const IconsBackground = () => {
  return (
    <Flex
      h="100%"
      w="100%"
      position="fixed"
      overflow="hidden"
      direction="column"
      alignItems="center"
      left="0"
      top={{ base: "-10%", md: 0 }}
    >
       <video width="100%" height="100%" autoPlay loop muted>
        <source src={fundo} type="video/mp4" />  {/* replace with your video */}
      </video>

      <Box position="relative" top="-200%" left="-20%">        
        {Array(120)
          .fill(<IconsLine />)
          .map((item, i) => (
            <Stack key={i}>{item}</Stack>
          ))}
         
      </Box>
    </Flex>
  );
};

export default IconsBackground;
