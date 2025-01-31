import { Flex,Modal,
  Stack,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,Image,Box } from "@chakra-ui/react";
import { motion} from "framer-motion";
import curriculo1 from "../../assets/img/curriculo1.jpg";
import curriculo2 from "../../assets/img/curriculo2.jpg";
import pdf from "../../assets/img/curriculo.pdf";
import { useState } from "react";
import falar from "../../components/TextAudio";
import {useRef } from "react";
import AnimatedStars from "../../components/AnimatedStars";


const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState("Curriculo Pag 1");
  const wrapperRef = useRef(null); // Referência para o container principal

  const handleImageClick = (imageSrc) => {
   if (imageSrc === curriculo1) {
      setTitle("Curriculo Página 1");
      falar("Atualmente, sou um aluno de mestrado no Instituto Federal do Espírito Santo (IFES),"+
      "onde estudo computação aplicada com ênfase em Inteligência Artificial. Em 2004, obtive meu diploma "+ 
      "como técnico em informática no IFES, mas acabei não seguindo carreira nessa área. Desde 2018,"+
      " decidi concentrar-me inteiramente no campo do desenvolvimento de software. Em 2020, obtive meu"+
      " diploma de Bacharel em Sistemas de Informação na Universidade Salesiana (Unisales). Possuo um desempenho excelente"+
      " em lógica de programação, tanto que fui monitor dessa disciplina durante minha graduação. Tenho habilidades em diversas"+
       "linguagens, incluindo HTML, PHP, CSS, SQL, JavaScript, Python, C, Java, Prolog e LaTeX. Além disso, possuo conhecimento em frameworks como React, React Native");
       } else {
      setTitle("Curriculo Página 2");
    }
    setSelectedImage(imageSrc);
    onOpen();
  };

  return (
    <Box
    as={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
     <Flex
             gap={5}
             h="90vh"
             w="100%"
             align="center"
             overflowY="auto"
             py={0}
             mb={12}
             overflowX="hidden"
             flexDirection="column"
             position="relative"
             scrollBehavior="smooth"
             ref={wrapperRef}
             css={{
               "&::-webkit-scrollbar": {
                 width: "5px", // Customização da barra de rolagem
                 height: "10px",
               },
               "&::-webkit-scrollbar-track": {
                 width: "6px",
               },
               "&::-webkit-scrollbar-thumb": {
                 background: "#42c920",
                 borderRadius: "24px",
               },
             }}
           >
             <Stack
          direction={{ base: "column", md: "row", lg: "row", sm: "column" }}
          spacing={5}
          w="100%"
          maxW="1200px"
          align="center"
          justify="center"
          px={4}
          py={4}          

        >
    <AnimatedStars />
    
          <Image
            src={curriculo1}
            w={{ base: 400, md: 200, lg: 450, sm: 100, xl: 450 }}         
            onClick={() => handleImageClick(curriculo1)}
            cursor="pointer"
            zIndex={1}
            key={curriculo1}
            onMouseOver={() => falar("Curriculo Página 1")}
          />
          <Image
            src={curriculo2}
            w={{ base: 400, md: 200, lg: 450, sm: 100, xl: 450 }}       
            onClick={() => handleImageClick(curriculo2)}
            cursor="pointer"
            zIndex={1}
            key={curriculo2}
            onMouseOver={() => falar("Curriculo Página 2")}
          />

<Button
    as="a"
    href={pdf}
    download="brunokobi.pdf"
    mt={4}
    mb={20}
    color={"#fff"} background={"#42c920"} _hover={{ background: "#256a10" }}
    onMouseOver={() => falar("Baixar PDF")}  >
    Baixar PDF
  </Button>
         </Stack>
       
      
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}
        size={"full"}
      >
        <ModalOverlay />
        <ModalContent>
        <ModalHeader
        background={"#000"} color={"#42c920"}
        >
          {title}
        </ModalHeader>
          <ModalCloseButton color={"#42c920"}
          border={"1px solid #42c920"
        }
          />
          <ModalBody  
          background={"#000"} color={"#42c920"}
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}


          >
            <Image src={selectedImage} w={"80%"} />
          </ModalBody>
        </ModalContent>
      </Modal>
    
    </Box>

  );
};

export default Home;
