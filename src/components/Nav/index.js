import React from "react";
import { 
  Breadcrumb, Flex, Stack, Box, HStack, 
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure 
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { Image } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import Item from "./Item";
import falar from "../TextAudio";

// --- IMPORTANTE: Importe seu formulário aqui ---
// Ajuste o caminho se necessário, baseando-se na sua estrutura anterior
import ContactForm from "../ContatoForm/ContactForm";

// Ícones
import { FaGlobe, FaReact } from "react-icons/fa";
import { AiOutlineLinkedin, AiOutlineGithub, AiOutlineFilePdf, AiOutlineMail } from "react-icons/ai"; // Adicionei AiOutlineMail
import { RiAliensFill } from "react-icons/ri";
import { IoMdRocket } from "react-icons/io";

// Imagens (mantive seus imports originais)
import usa from "../../assets/img/usa.png";
import brazil from "../../assets/img/brazil.png";
import spain from "../../assets/img/spain.png";
import france from "../../assets/img/france.png";
import germany from "../../assets/img/germany.png";
import russia from "../../assets/img/russia.png";
import arabe from "../../assets/img/arabe.png";
import klingon from "../../assets/img/klingo.png";
import china from "../../assets/img/china.png";

const languages = [
  { id: "pt", img: brazil, label: "pt" },
  { id: "en", img: usa, label: "en" },
  { id: "es", img: spain, label: "es" },
  { id: "fr", img: france, label: "fr" },
  { id: "de", img: germany, label: "de" },
  { id: "zh", img: china, label: "zh" },
  { id: "ru", img: russia, label: "ru" },
  { id: "ar", img: arabe, label: "ar" },
  { id: "kl", img: klingon, label: "kl" },
];

const Nav = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  
  // --- 1. Hook para controlar o Modal do Formulário ---
  const { isOpen, onOpen, onClose } = useDisclosure();

  const ls = localStorage.getItem("i18nConfig");
  const langConfig = ls ? JSON.parse(ls) : { selectedLang: "pt" };
  const currentLang = langConfig.selectedLang;

  const sections = [
    { label: intl.formatMessage({ id: "home" }), url: `/`, icon: IoMdRocket },
    { label: intl.formatMessage({ id: "sobre" }), url: `/about`, icon: RiAliensFill },
    { label: intl.formatMessage({ id: "projetos" }), url: `/projects`, icon: FaReact },
    
    // --- 2. Item de Contato (Note a prop 'isAction') ---
    // Coloquei um identificador para sabermos que esse item abre o modal e não muda de página
    { label: "Contato", icon: AiOutlineMail, isAction: true, action: onOpen },
    
    { label: "Mapa Esri", url: "/Map", icon: FaGlobe },
    { label: intl.formatMessage({ id: "linkedin" }), url: "https://www.linkedin.com/in/brunokobi/", icon: AiOutlineLinkedin },
    { label: intl.formatMessage({ id: "github" }), url: "https://github.com/brunokobi", icon: AiOutlineGithub },
    { label: "Curriculo", url: "/curriculo", icon: AiOutlineFilePdf },
  ];

  const handleLanguageChange = (langId) => {
    localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: langId }));
    navigate("/");
    window.location.reload();
  };

  const LanguageButton = ({ lang }) => {
    const isSelected = currentLang === lang.id;
    const activeStyle = {
      borderColor: "#42c920",
      filter: "drop-shadow(0px 0px 8px #42c920)",
      transform: "scale(1.1)",
    };

    return (
      <Box
        as="button"
        onClick={() => handleLanguageChange(lang.id)}
        onMouseOver={() => falar(intl.formatMessage({ id: lang.id }))}
        mx={1}
        flexShrink={0}
      >
        <Image
          src={lang.img}
          alt={lang.id}
          title={intl.formatMessage({ id: lang.id })}
          w={{ base: "1.8rem", md: "1.5rem" }}
          h={{ base: "1.8rem", md: "1.5rem" }}
          borderRadius="full"
          border="2px solid transparent"
          transition="all 0.2s"
          style={isSelected ? activeStyle : {}}
          _hover={{ ...activeStyle, borderColor: "#42c920" }}
        />
      </Box>
    );
  };

  return (
    <AnimatePresence>
      <Flex
        as="nav"
        position="fixed"
        bottom={0}
        w="100%"
        zIndex={999999}
        bg="black"
        borderTop="1px solid"
        borderColor="whiteAlpha.400"
        color="whiteAlpha.700"
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align="center"
        py={2}
        px={4}
        boxShadow="0 -4px 20px rgba(0,0,0,0.5)"
      >
        <Box
          w={{ base: "100%", lg: "auto" }}
          overflowX={{ base: "auto", lg: "visible" }}
          css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
          mb={{ base: 2, lg: 0 }}
        >
          <Stack
            direction="row"
            spacing={0}
            justify={{ base: "flex-start", lg: "center" }}
            align="center"
            minW={{ base: "max-content", lg: "auto" }}
            px={{ base: 2, lg: 0 }}
          >
            <Breadcrumb separator="" spacing={0}>
              {sections.map((section, i) => {
                // --- 3. Lógica para renderizar o botão de Contato ---
                if (section.isAction) {
                  return (
                    <Box 
                      key={i} 
                      onClick={section.action} 
                      cursor="pointer"
                      display="inline-flex" // Garante alinhamento com os Breadcrumbs
                    >
                      {/* Reutilizamos o visual do Item, mas passamos url="#" para não navegar */}
                      <Item label={section.label} url="#" icon={section.icon} />
                    </Box>
                  );
                }
                
                // Renderização normal dos links
                return (
                  <Item 
                    label={section.label} 
                    url={section.url} 
                    icon={section.icon} 
                    key={i} 
                  />
                );
              })}
            </Breadcrumb>
          </Stack>
        </Box>

        <Box
          w={{ base: "100%", lg: "auto" }}
          overflowX={{ base: "auto", lg: "visible" }}
          maxW="100vw"
          css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", "-ms-overflow-style": "none" }}
        >
          <HStack
            spacing={3}
            minW={{ base: "max-content", lg: "auto" }}
            justify={{ base: "flex-start", lg: "flex-end" }}
            px={4}
            py={2}
          >
            {languages.map((lang) => (
              <LanguageButton key={lang.id} lang={lang} />
            ))}
          </HStack>
        </Box>
      </Flex>

      {/* --- 4. O Modal que contém o Formulário --- */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent bg="transparent" boxShadow="none" border="none">
          <ModalCloseButton 
            color="#39ff14" 
            zIndex={10} 
            bg="black" 
            border="1px solid #39ff14"
            _hover={{ bg: "#39ff14", color: "black" }}
          />
          <ModalBody p={0}>
             {/* AQUI ESTÁ A CORREÇÃO: Passamos a função onClose */}
             <ContactForm onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>

    </AnimatePresence>
  );
};

export default Nav;