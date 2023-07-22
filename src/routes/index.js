import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Nav from "../components/Nav";
import InputComChat from "../pages/ChatGPT/index";
import Mapa from "../pages/Map/index";
import React, { useState } from 'react';
import { Button, Icon } from '@chakra-ui/react'; // Certifique-se de ter o pacote @chakra-ui/react instalado
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'; // Certifique-se de ter o pacote react-icons instalado
//import falar from '../components/TextAudio'



const Router = () => {
const audio = localStorage.getItem('Audio'); 
 

  const [isAudioOn, setIsAudioOn] = useState(
    {
      audio: audio === 'on' ? true : false
    }
  );

  

  const toggleAudio = () => {
    setIsAudioOn((prev) => !prev);
    if (isAudioOn) {
      localStorage.setItem('Audio', 'off');
    }
    else {
      localStorage.setItem('Audio', 'on');
    }    
  };

  return (
    <Box minH="100vh" bg="black" color="rgb(196, 196, 196)">
        <Box position="fixed" top="10px" right="10px" zIndex="999">
      <Button onClick={toggleAudio} bgColor="transparent" _hover={{ bgColor: 'transparent' }}
      variant='outline' borderColor={isAudioOn ? '#42c920' : 'red'} borderRadius="full" borderWidth={2}
      // onMouseOver={() => falar(isAudioOn ? 'Desativar áudio' : 'Ativar áudio')}
      width={"2.0rem"} 
      >
        <Icon as={isAudioOn ? FaVolumeUp : FaVolumeMute} color={isAudioOn ? '#42c920' : 'red'} 
        width={"2.0rem"} 
        title={isAudioOn ? 'Desativar áudio' : 'Ativar áudio'}
        />
      </Button>
    </Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/chat" element={<InputComChat />} /> 
        <Route path="/map" element={<Mapa />} />                  
      </Routes>
      <Nav />
    </Box>
  );
};

export default Router;
