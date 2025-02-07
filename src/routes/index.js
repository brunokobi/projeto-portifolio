import { Routes, Route } from "react-router-dom";
import { Box,Image,Heading} from "@chakra-ui/react";
import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Curriculo from "../pages/Curriculo";
import Nav from "../components/Nav";
import LlamaChat from "../pages/ChatGPT/index";
import Mapa from "../pages/Map/index";
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@chakra-ui/react'; // Certifique-se de ter o pacote @chakra-ui/react instalado
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'; // Certifique-se de ter o pacote react-icons instalado
//import falar from '../components/TextAudio'
// import ObjectDetection from "../pages/ObjectDetection/index";



const Router = () => {
const audio = localStorage.getItem('Audio'); 
const [isAudioOn, setIsAudioOn] = useState(false);

useEffect(() => {
  console.log( 'teste audio', audio);
  if (audio === 'on') {
    setIsAudioOn(true);
  } else if (audio === 'off') {
    setIsAudioOn(false);
  }else if (audio === null){
    setIsAudioOn(false);
  }
}, [audio]);



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
    
    
           
     <Box position="fixed" top="10px" left="10px" zIndex="9999">
  <Heading
    position="relative"
    mb={2} // Adiciona um pequeno espaçamento entre o texto e a imagem
    zIndex="999"
    textShadow={{
      base: "0px 0px 20px #42c920",
      md: "0px 0px 8px #42c920",
      lg: "0px 0px 10px #42c920",
    }}
    fontSize={{ base: "1.0rem" }}
    color={"#42c920"}
  >
    Visitas
  </Heading>  
  <Image 
    alt="contador de visitas"     
    src="https://websmultimedia.com/contador-de-visitas.php?id=11541"
  />
</Box>

     
  
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
        <Route path="/chat" element={<LlamaChat />} /> 
        {/* <Route path="/object" element={<ObjectDetection />} /> */}
        <Route path="/map" element={<Mapa />} />
        <Route path="/curriculo" element={<Curriculo />} />

      </Routes>
      <Nav />
    </Box>
  );
};

export default Router;
