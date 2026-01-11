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
import { useIntl } from "react-intl"; // Biblioteca para internacionalização


const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState("Curriculo Pag 1");
  const wrapperRef = useRef(null); // Referência para o container principal
  const intl = useIntl(); // Objeto para acessar mensagens traduzidas

  const handleImageClick = (imageSrc) => {   
   if (imageSrc === curriculo1) {
      setTitle("Curriculo Página 1");
      falar(intl.formatMessage({ id: "educacao1" }));
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
