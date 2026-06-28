import { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import fundo from "../../assets/img/fundo.mp4";

const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const timer = setTimeout(() => {
      const src = v.querySelector("source")?.getAttribute("src");
      if (src) v.src = src;
      v.muted = true;
      v.load();
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
