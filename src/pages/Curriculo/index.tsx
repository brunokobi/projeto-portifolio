import {
  Flex,
  Modal,
  Stack,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Image,
  Box,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import curriculo1 from "../../assets/img/curriculo1.jpg";
import curriculo2 from "../../assets/img/curriculo2.jpg";
import pdf from "../../assets/img/curriculo.pdf";
import { useState } from "react";
import falar from "../../components/TextAudio";
import { useRef } from "react";
import AnimatedStars from "../../components/AnimatedStars";
import { useIntl } from "react-intl"; // Biblioteca para internacionalização

const Curriculo = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("Curriculo Pag 1");
  const wrapperRef = useRef<HTMLDivElement>(null); // Referência para o container principal
  const intl = useIntl(); // Objeto para acessar mensagens traduzidas

  const handleImageClick = (imageSrc: string) => {
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
    <Box as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Flex
        gap={5}
        h="90dvh"
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
            w={{ base: "100%", md: 200, lg: 450, xl: 450 }}
            maxW="450px"
            onClick={() => handleImageClick(curriculo1)}
            cursor="pointer"
            zIndex={1}
            key={curriculo1}
            onMouseOver={() => falar("Curriculo Página 1")}
          />
          <Image
            src={curriculo2}
            w={{ base: "100%", md: 200, lg: 450, xl: 450 }}
            maxW="450px"
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
            order={{ base: -1, md: 0 }}
            mt={{ base: 0, md: 4 }}
            mb={{ base: 0, md: 20 }}
            minH="44px"
            color={"#fff"}
            background={"#42c920"}
            _hover={{ background: "#256a10" }}
            onMouseOver={() => falar("Baixar PDF")}
          >
            Baixar PDF
          </Button>
        </Stack>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader background={"#000"} color={"#42c920"}>
            {title}
          </ModalHeader>
          <ModalCloseButton color={"#42c920"} border={"1px solid #42c920"} />
          <ModalBody
            background={"#000"}
            color={"#42c920"}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
          >
            <Image src={selectedImage ?? undefined} w={{ base: "100%", md: "80%" }} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Curriculo;
