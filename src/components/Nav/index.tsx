import React, { useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
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
import { getGeoIP } from "../../utils/geoip";

// Ícones
import { FaGlobe, FaReact } from "react-icons/fa";
import { AiOutlineLinkedin, AiOutlineGithub, AiOutlineMail } from "react-icons/ai";
import { MdOutlineNewspaper } from "react-icons/md";
import { RiAliensFill } from "react-icons/ri";
import { IoMdRocket } from "react-icons/io";
import { BiCube } from "react-icons/bi";

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

// Mapeamento país → idioma
const COUNTRY_TO_LANG: Record<string, string> = {
  BR: "pt",
  PT: "pt",
  US: "en", GB: "en", AU: "en", CA: "en", NZ: "en", IE: "en", ZA: "en",
  ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", VE: "es",
  UY: "es", PY: "es", BO: "es", EC: "es", CR: "es", PA: "es", DO: "es",
  GT: "es", HN: "es", SV: "es", NI: "es", CU: "es",
  FR: "fr", BE: "fr", CH: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr",
  DE: "de", AT: "de",
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
  RU: "ru", BY: "ru", KZ: "ru",
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", LY: "ar",
  JO: "ar", LB: "ar", SY: "ar", IQ: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", YE: "ar",
};

const activeStyle = {
  borderColor: "#42c920",
  filter: "drop-shadow(0px 0px 8px #42c920)",
  transform: "scale(1.1)",
};

interface LanguageButtonProps {
  lang: { id: string; img: string; label: string };
  currentLang: string;
  onLanguageChange: (id: string) => void;
  intl: { formatMessage: (descriptor: { id: string }) => string };
}

const LanguageButton = ({ lang, currentLang, onLanguageChange, intl }: LanguageButtonProps) => {
  const isSelected = currentLang === lang.id;

  return (
    <Box
      as="button"
      onClick={() => onLanguageChange(lang.id)}
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

const Nav = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { locale: currentLang, setLanguage } = useLanguage();

  // Detecta o país do visitante e define o idioma automaticamente na primeira visita
  useEffect(() => {
    const ls = localStorage.getItem("i18nConfig");
    if (ls) return; // já tem preferência salva, não sobrescreve
    getGeoIP().then((data) => {
      const lang = COUNTRY_TO_LANG[data.country_code ?? ""];
      if (lang && lang !== "pt") {
        setLanguage(lang);
      }
    }).catch(() => {});
  // eslint-disable-next-line
  }, []);

  const sections = [
    { label: intl.formatMessage({ id: "home" }), url: `/`, icon: IoMdRocket },
    { label: intl.formatMessage({ id: "sobre" }), url: `/about`, icon: RiAliensFill },
    { label: intl.formatMessage({ id: "projetos" }), url: `/projects`, icon: FaReact },
    
    { label: "Contato", icon: AiOutlineMail, isAction: true, action: onOpen },
    { label: "Portfolio 3D", url: "https://brunokobi3d.netlify.app", icon: BiCube },
    
    { label: "Mapa Esri", url: "/map", icon: FaGlobe },
    { label: intl.formatMessage({ id: "linkedin" }), url: "https://www.linkedin.com/in/brunokobi/", icon: AiOutlineLinkedin },
    { label: intl.formatMessage({ id: "github" }), url: "https://github.com/brunokobi", icon: AiOutlineGithub },
    { label: "Notícias IA", url: "/news", icon: MdOutlineNewspaper },
  ];

  const handleLanguageChange = (langId: string) => {
    setLanguage(langId);
    navigate("/");
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
                if (section.isAction) {
                  return (
                    <Box
                      key={i}
                      onClick={section.action}
                      cursor="pointer"
                      display="inline-flex"
                    >
                      {/* Reutilizamos o visual do Item, mas passamos url="#" para não navegar */}
                      <Item label={section.label} url="#" icon={section.icon} />
                    </Box>
                  );
                }
                
                return (
                  <Item
                    label={section.label}
                    url={section.url ?? "#"}
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
              <LanguageButton
                key={lang.id}
                lang={lang}
                currentLang={currentLang}
                onLanguageChange={handleLanguageChange}
                intl={intl}
              />
            ))}
          </HStack>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "full", md: "xl" }} scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent bg="transparent" boxShadow="none" border="none" maxH={{ base: "100dvh", md: "90vh" }} my={{ base: 0, md: 4 }}>
          <ModalCloseButton
            color="#39ff14"
            zIndex={10}
            bg="black"
            border="1px solid #39ff14"
            _hover={{ bg: "#39ff14", color: "black" }}
          />
          <ModalBody p={{ base: 2, md: 0 }} overflowY="auto">
            <ContactForm onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>

    </AnimatePresence>
  );
};

export default Nav;