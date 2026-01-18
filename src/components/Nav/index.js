import React from "react";
import { Breadcrumb, Flex, Stack, Box, HStack } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { Image } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import Item from "./Item";
import falar from "../TextAudio";

// Ícones
import { FaGlobe, FaReact } from "react-icons/fa";
import { AiOutlineLinkedin, AiOutlineGithub, AiOutlineFilePdf } from "react-icons/ai";
import { RiAliensFill } from "react-icons/ri";
import { IoMdRocket } from "react-icons/io";

// Imagens
import usa from "../../assets/img/usa.png";
import brazil from "../../assets/img/brazil.png";
import spain from "../../assets/img/spain.png";
import france from "../../assets/img/france.png";
import germany from "../../assets/img/germany.png";
import russia from "../../assets/img/russia.png";
import arabe from "../../assets/img/arabe.png";
import klingon from "../../assets/img/klingo.png";
import china from "../../assets/img/china.png";

// Configuração dos idiomas para evitar repetição de código
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

  // Recupera idioma atual
  const ls = localStorage.getItem("i18nConfig");
  const langConfig = ls ? JSON.parse(ls) : { selectedLang: "pt" };
  const currentLang = langConfig.selectedLang;

  const sections = [
    { label: intl.formatMessage({ id: "home" }), url: `/`, icon: IoMdRocket },
    { label: intl.formatMessage({ id: "sobre" }), url: `/about`, icon: RiAliensFill },
    { label: intl.formatMessage({ id: "projetos" }), url: `/projects`, icon: FaReact },
    { label: "Mapa Esri", url: "/Map", icon: FaGlobe },
    { label: intl.formatMessage({ id: "linkedin" }), url: "https://www.linkedin.com/in/brunokobi/", icon: AiOutlineLinkedin },
    { label: intl.formatMessage({ id: "github" }), url: "https://github.com/brunokobi", icon: AiOutlineGithub },
    { label: "Curriculo", url: "/curriculo", icon: AiOutlineFilePdf },
  ];

  // Função para trocar idioma
  const handleLanguageChange = (langId) => {
    localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: langId }));
    navigate("/");
    window.location.reload();
  };

  // Componente interno para renderizar o botão de idioma (DRY - Don't Repeat Yourself)
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
        flexShrink={0} // Impede que o botão encolha no mobile
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
          _hover={{
            ...activeStyle,
            borderColor: "#42c920",
          }}
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
        direction={{ base: "column", lg: "row" }} // Coluna no mobile, Linha no desktop
        justify="space-between"
        align="center"
        py={2}
        px={4}
        boxShadow="0 -4px 20px rgba(0,0,0,0.5)"
      >
        {/* SEÇÃO 1: Links de Navegação */}
        <Box
          w={{ base: "100%", lg: "auto" }}
          overflowX={{ base: "auto", lg: "visible" }} // Scroll horizontal no mobile
          css={{
            "&::-webkit-scrollbar": { display: "none" }, // Esconde barra de rolagem
            scrollbarWidth: "none",
          }}
          mb={{ base: 2, lg: 0 }}
        >
          <Stack
            direction="row"
            spacing={0}
            justify={{ base: "flex-start", lg: "center" }}
            align="center"
            minW={{ base: "max-content", lg: "auto" }} // Garante largura para scroll
            px={{ base: 2, lg: 0 }}
          >
            <Breadcrumb separator="" spacing={0}>
              {sections.map(({ label, url, icon }, i) => (
                <Item label={label} url={url} icon={icon} key={i} />
              ))}
            </Breadcrumb>
          </Stack>
        </Box>

        {/* SEÇÃO 2: Bandeiras de Idiomas */}
        <Box
  w={{ base: "100%", lg: "auto" }}
  overflowX={{ base: "auto", lg: "visible" }} // Ativa rolagem no mobile
  maxW="100vw" // Garante que não estoure a largura da viewport
  css={{
    "&::-webkit-scrollbar": { display: "none" }, // Esconde barra no Chrome/Safari
    scrollbarWidth: "none", // Esconde barra no Firefox
    "-ms-overflow-style": "none", // Esconde barra no IE/Edge
  }}
>
  <HStack
    spacing={3} // Espaçamento entre as bandeiras
    // O segredo está aqui: minW="max-content" força o HStack a ter a largura
    // real dos itens, impedindo a quebra de linha.
    minW={{ base: "max-content", lg: "auto" }} 
    
    // No mobile, usamos 'flex-start' para o scroll começar da esquerda.
    // Se usar 'center' com scroll, os primeiros itens podem ficar cortados.
    justify={{ base: "flex-start", lg: "flex-end" }} 
    
    px={4} // Um pouco de respiro nas laterais para a primeira/última bandeira não colar na borda
    py={2}
  >
    {languages.map((lang) => (
      <LanguageButton key={lang.id} lang={lang} />
    ))}
  </HStack>
</Box>
      </Flex>
    </AnimatePresence>
  );
};

export default Nav;