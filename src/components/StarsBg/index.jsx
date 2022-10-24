import { Box } from "@chakra-ui/react";
import stars from "../../assets/img/stars.mp4";

const StarsBg = () => {
  return (
    <Box w="100%" h="100vh" position="fixed">
      <video loop autoPlay={true} width="100%" zIndex={-999}>
        <source src={stars} type="video/mp4" />
      </video>
    </Box>
  );
};

export default StarsBg;
