import { Routes, Route, useLocation } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import React, { useState, Suspense, lazy } from "react";
import { Button, Icon } from "@chakra-ui/react";
import ErrorBoundary from "../components/ErrorBoundary";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import Nav from "../components/Nav";

// Lazy loading: cada página vira chunk separado — não entra no bundle inicial
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Projects = lazy(() => import("../pages/Projects"));
const Curriculo = lazy(() => import("../pages/Curriculo"));
const LlamaChat = lazy(() => import("../pages/ChatGPT/index"));
const Mapa = lazy(() => import("../pages/Map/index"));
const News = lazy(() => import("../pages/News/index"));

const PageLoader = () => (
  <Box h="100vh" display="flex" alignItems="center" justifyContent="center" bg="black">
    <Spinner color="#42c920" size="xl" thickness="3px" />
  </Box>
);

const Router = () => {
  const { pathname } = useLocation();
  const isNews = pathname.startsWith("/news");
  const audio = localStorage.getItem("Audio");
  const [isAudioOn, setIsAudioOn] = useState(audio === "on");

  const toggleAudio = () => {
    const next = !isAudioOn;
    setIsAudioOn(next);
    localStorage.setItem("Audio", next ? "on" : "off");
  };

  return (
    <Box minH="100vh" bg="black" color="rgb(196, 196, 196)">
      {!isNews && (
        <Box position="fixed" top="44px" right="10px" zIndex="999">
          <Button
            onClick={toggleAudio}
            bgColor="transparent"
            _hover={{ bgColor: "transparent" }}
            variant="outline"
            borderColor={isAudioOn ? "#42c920" : "red"}
            borderRadius="full"
            borderWidth={2}
            width="2.0rem"
          >
            <Icon
              as={isAudioOn ? FaVolumeUp : FaVolumeMute}
              color={isAudioOn ? "#42c920" : "red"}
              width="2.0rem"
              title={isAudioOn ? "Desativar áudio" : "Ativar áudio"}
            />
          </Button>
        </Box>
      )}

      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/chat" element={<LlamaChat />} />
            <Route path="/map" element={<Mapa />} />
            <Route path="/curriculo" element={<Curriculo />} />
            <Route path="/news" element={<News />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {!isNews && <Nav />}
    </Box>
  );
};

export default Router;
