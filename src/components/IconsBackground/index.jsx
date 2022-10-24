import { Box, Flex } from "@chakra-ui/react";

import IconsLine from "../IconsLine";

const IconsBackground = () => {
  return (
    <Flex
      h="100vh"
      w="100%"
      position="fixed"
      overflow="hidden"
      direction="column"
      alignItems="center"
      left="0"
      top={{ base: "-10%", md: 0 }}
    >
      <Box position="relative" top="-50%">
        {Array(20)
          .fill(<IconsLine />)
          .map((item, i) => (
            <Flex key={i}>{item}</Flex>
          ))}
      </Box>
    </Flex>
  );
};

export default IconsBackground;
