import { Box } from "@chakra-ui/react";
import stars from "../../assets/img/stars.mp4";

const StarsBg = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"   // Garante largura da viewport
      height="100vh"  // Garante altura da viewport
      zIndex="-999"
      overflow="hidden" // Evita barras de rolagem indesejadas
    >
      <video
        autoPlay
        loop
        muted
        playsInline // Essencial para mobile não abrir em tela cheia
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // O SEGREDO: Corta as bordas para preencher sem distorcer
          position: "absolute",
          top: "0",
          left: "0",
        }}
      >
        <source src={stars} type="video/mp4" />
      </video>
    </Box>
  );
};

export default StarsBg;