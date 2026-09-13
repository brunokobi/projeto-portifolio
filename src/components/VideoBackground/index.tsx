import { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import fundo from "../../assets/img/fundo.mp4";

const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Antes disto reatribuía `v.src` pro mesmo valor do <source> e chamava
    // `v.load()` — como já é a mesma URL, isso não "recarrega" nada, só
    // força o navegador a buscar o vídeo inteiro de novo do zero (download
    // duplicado). `play()` sozinho já dispara o carregamento (preload="none"
    // só adia o carregamento automático do navegador, não impede o play).
    const timer = setTimeout(() => {
      v.muted = true;
      v.play().catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      zIndex={0}
      pointerEvents="none"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: 0.25,
        }}
      >
        <source src={fundo} type="video/mp4" />
      </video>
    </Box>
  );
};

export default VideoBackground;
