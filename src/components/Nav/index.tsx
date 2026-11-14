import React, { useEffect } from "react";
import { useLanguage } from "../../contexts/useLanguage";
import {
  Flex,
  Box,
  HStack,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
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
import { track } from "../../utils/track";

// Ícones
import { FaGlobe, FaReact } from "react-icons/fa";
import { AiOutlineLinkedin, AiOutlineGithub, AiOutlineMail } from "react-icons/ai";
import { MdOutlineNewspaper, MdBusiness } from "react-icons/md";
import { RiAliensFill, RiRobotLine } from "react-icons/ri";
import { IoMdRocket } from "react-icons/io";
import { BiCube } from "react-icons/bi";
import { FaBlog } from "react-icons/fa";
import { FiChevronUp } from "react-icons/fi";
import { openJarvisChat } from "../ChatButton/openJarvisChat";

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
  US: "en",
  GB: "en",
  AU: "en",
  CA: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",
  ES: "es",
  MX: "es",
  AR: "es",
  CL: "es",
  CO: "es",
  PE: "es",
  VE: "es",
  UY: "es",
  PY: "es",
  BO: "es",
  EC: "es",
  CR: "es",
  PA: "es",
  DO: "es",
  GT: "es",
  HN: "es",
  SV: "es",
  NI: "es",
  CU: "es",
  FR: "fr",
  BE: "fr",
  CH: "fr",
  LU: "fr",
  MC: "fr",
  SN: "fr",
  CI: "fr",
  DE: "de",
  AT: "de",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  SG: "zh",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  SA: "ar",
  AE: "ar",
  EG: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  LY: "ar",
  JO: "ar",
  LB: "ar",
  SY: "ar",
  IQ: "ar",
  KW: "ar",
  QA: "ar",
  BH: "ar",
  OM: "ar",
  YE: "ar",
};

const GREEN = "#42c920";

interface LanguageMenuProps {
  currentLang: string;
  onLanguageChange: (id: string) => void;
  intl: { formatMessage: (descriptor: { id: string }) => string };
}

const LanguageMenu = ({ currentLang, onLanguageChange, intl }: LanguageMenuProps) => {
  const current = languages.find((lang) => lang.id === currentLang) ?? languages[0];

  return (
    <Menu placement="top-end" isLazy>
      <MenuButton
        aria-label={intl.formatMessage({ id: current.id })}
        onMouseEnter={() => falar(intl.formatMessage({ id: current.id }))}
        px={{ base: 1, md: 2 }}
        py={1}
        rounded="full"
        border="1px solid"
        borderColor="whiteAlpha.300"
        _hover={{ borderColor: GREEN }}
        _expanded={{ borderColor: GREEN }}
      >
        <HStack spacing={1}>
          <Image src={current.img} alt="" w="1.5rem" h="1.5rem" borderRadius="full" />
          <Text as="span" fontSize="xs" fontFamily="mono" textTransform="uppercase" display={{ base: "none", md: "inline" }}>
            {current.label}
          </Text>
          <Box as="span" display={{ base: "none", md: "inline" }}>
            <FiChevronUp />
          </Box>
        </HStack>
      </MenuButton>
      <MenuList bg="black" borderColor="whiteAlpha.400" minW="180px" zIndex={1000000}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            bg="black"
            color={lang.id === currentLang ? GREEN : "whiteAlpha.800"}
            _hover={{ bg: "whiteAlpha.100", color: GREEN }}
            icon={<Image src={lang.img} alt="" w="1.25rem" h="1.25rem" borderRadius="full" />}
          >
            {intl.formatMessage({ id: lang.id })}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
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
    getGeoIP()
      .then((data) => {
        const lang = COUNTRY_TO_LANG[data.country_code ?? ""];
        if (lang && lang !== "pt") {
          setLanguage(lang);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line
  }, []);

  const openContact = () => {
    onOpen();
    track({ event: "contact_opened" });
  };

  const openJarvis = () => {
    track({ event: "jarvis_opened_from_menu" });
    if (!openJarvisChat()) navigate("/chat");
  };

  const pages = [
    { label: intl.formatMessage({ id: "home" }), url: "/", icon: IoMdRocket },
    { label: intl.formatMessage({ id: "sobre" }), url: "/about", icon: RiAliensFill },
    { label: intl.formatMessage({ id: "projetos" }), url: "/projects", icon: FaReact },
    { label: "JARVIS", icon: RiRobotLine, onClick: openJarvis },
    { label: "Contato", icon: AiOutlineMail, onClick: openContact },
    { label: "Mapa Esri", url: "/map", icon: FaGlobe },
    { label: "Notícias IA", url: "/news", icon: MdOutlineNewspaper },
    { label: "Blog Dev", url: "/blog", icon: FaBlog },
  ];

  const externals = [
    { label: "Portfolio 3D", url: "https://brunokobi3d.netlify.app", icon: BiCube },
    { label: "Empresas GV", url: "https://empresas.brunokobi.tech/", icon: MdBusiness },
    { label: intl.formatMessage({ id: "linkedin" }), url: "https://www.linkedin.com/in/brunokobi/", icon: AiOutlineLinkedin },
    { label: intl.formatMessage({ id: "github" }), url: "https://github.com/brunokobi", icon: AiOutlineGithub },
  ];

  const handleLanguageChange = (langId: string) => {
    setLanguage(langId);
    navigate("/");
  };

  return (
    <AnimatePresence>
      <Flex
        as="nav"
        aria-label="Menu principal"
        position="fixed"
        bottom={0}
        w="100%"
        zIndex={999999}
        bg="black"
        borderTop="1px solid"
        borderColor="whiteAlpha.400"
        color="whiteAlpha.700"
        justify="center"
        align="center"
        py={1}
        px={{ base: 1, md: 2 }}
        boxShadow="0 -4px 20px rgba(0,0,0,0.5)"
      >
        <HStack
          spacing={{ base: 0, md: 1 }}
          overflowX="auto"
          maxW="100%"
          css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
        >
          {pages.map((page) => (
            <Item key={page.label} {...page} />
          ))}
          <Divider orientation="vertical" h="24px" borderColor="whiteAlpha.400" mx={{ base: 0.5, md: 2 }} />
          {externals.map((link) => (
            <Item key={link.label} {...link} />
          ))}
          <Divider orientation="vertical" h="24px" borderColor="whiteAlpha.400" mx={{ base: 0.5, md: 2 }} />
          <Box flexShrink={0}>
            <LanguageMenu currentLang={currentLang} onLanguageChange={handleLanguageChange} intl={intl} />
          </Box>
        </HStack>
      </Flex>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size={{ base: "full", md: "xl" }}
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          border="none"
          maxH={{ base: "100dvh", md: "90vh" }}
          my={{ base: 0, md: 4 }}
        >
          <ModalBody p={{ base: 2, md: 0 }} overflowY="auto">
            <ContactForm onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </AnimatePresence>
  );
};

export default Nav;
