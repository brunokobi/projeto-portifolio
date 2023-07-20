import { Breadcrumb, Flex, Stack } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import usa from "../../assets/img/usa.png";
import brazil from "../../assets/img/brazil.png";
import spain from "../../assets/img/spain.png";
import france from "../../assets/img/france.png";
import germany from "../../assets/img/germany.png";
import russia from "../../assets/img/russia.png";
import arabe from "../../assets/img/arabe.png";
import klingon from "../../assets/img/klingo.png";
import { FaGlobe, FaReact} from "react-icons/fa";
import { AiOutlineLinkedin } from "react-icons/ai";
import { AiOutlineGithub } from "react-icons/ai";
// import { AiOutlineInstagram } from "react-icons/ai";
// import { AiOutlineFacebook } from "react-icons/ai";
import { RiAliensFill } from "react-icons/ri";
import { IoMdRocket } from "react-icons/io";
import china from "../../assets/img/china.png";
import { Image } from "@chakra-ui/react";
import {useIntl} from 'react-intl';
import {useNavigate} from 'react-router-dom'
import Item from "./Item";



const Nav = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const sections = [
    {
      label: intl.formatMessage({ id: "home" }),
      url: `/`,
      icon: IoMdRocket,
    },
    {
      label: intl.formatMessage({id: 'sobre'}),
      url:  `/about`,
      icon: RiAliensFill,
    },
  
    {
      label: intl.formatMessage({id: 'projetos'}),
      url:  `/projects`,
      icon: FaReact,
    }, 
    // {
    //   label: "ChatGPT",
    //   // label: intl.formatMessage({id: 'projetos'}),
    //   url: "/chat",
    //   icon: FaRobot,
    // },
    {
      label: "Mapa Esri",
      // label: intl.formatMessage({id: 'projetos'}),
      url: "/Map",
      icon: FaGlobe,
    },        
    {
      label: intl.formatMessage({id: 'linkedin'}),
      url: "https://www.linkedin.com/in/brunokobi/",
      icon: AiOutlineLinkedin,
    },
    {
      label: intl.formatMessage({id: 'github'}),
      url: "https://github.com/brunokobi",
      icon: AiOutlineGithub,
    }, 
    // {
    //   label: intl.formatMessage({id: 'instagram'}),
    //   url: "https://www.instagram.com/brunokobi/",
    //   icon: AiOutlineInstagram,
    // },
    // {
    //   label: intl.formatMessage({id: 'facebook'}),
    //   url: "https://www.facebook.com/bruno.kobi/",
    //   icon: AiOutlineFacebook,
    // },
        
  
  ];
  let ls = localStorage.getItem("i18nConfig")
  let lang = JSON.parse(ls)
  let idioma = 'pt'
  if(lang){
  idioma =lang.selectedLang
  }
  

  return (
    <AnimatePresence>
      <Flex
        py={4}
        justify="center"
        position="fixed"
        bottom={0}
        w="100%"
        color="whiteAlpha.700"
        borderTop="1px solid"
        borderColor="whiteAlpha.400"
        background="black"
        zIndex={999999}
      >
        <Stack 
       width="80%"
      align="center" // Centraliza horizontalmente os elementos no Stack
      justify="center" // Centraliza verticalmente os elementos no Stack
      >
        <Breadcrumb
          fontWeight="medium"
          fontSize="sm"
          spacing={{ base:0, md: 0}}
          separator=""

        >
          {sections.map(({ label, url, icon }, i) => (
            <Item {...{ label, url, icon }} key={i} />
          ))}
        </Breadcrumb>
        </Stack>

        <Stack 
       width="20%"
      align="center" // Centraliza horizontalmente os elementos no Stack
      justify="center" // Centraliza verticalmente os elementos no Stack
      direction={{ base: "row", md: "row" }}
      >
       

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'pt' }));
          navigate('/')
          window.location.reload();}}>
          <Image src={brazil} w={{ base: 25, md:25}} margin={'1'} title= {intl.formatMessage({id: 'pt'})} 
           _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='pt' ? {  color: "#42c920",
            border: "groove 3px #42c920",
            borderRadius: "25px",        
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'en' }));        
           navigate('/')
          window.location.reload();}}>
          <Image src={usa} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'en'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='en' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'es' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={spain} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'es'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='es' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button> 

        <button  onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'fr' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={france} w={{ base: 25, md: 25 }} margin={'1'}title= {intl.formatMessage({id: 'fr'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='fr' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button>

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'de' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={germany} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'de'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='de' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
          </button> 

          <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'zh' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={china} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'zh'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='zh' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'ru' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={russia} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'ru'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='ru' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'ar' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={arabe} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'ar'})}
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",                     
          }}
          style={{
            ...(idioma==='ar' ? {  color: "#42c920",
             border: "groove 3px #42c920",
            borderRadius: "25px",             transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.0rem",  } : ""),
          }}
          />
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'kl' }));
           navigate('/')
          window.location.reload();}}>
          <Image src={klingon} w={{ base: 35, md: 35 }} margin={'1'} title= {intl.formatMessage({id: 'kl'})}
          borderRadius="full"
            _hover={{
            color: "#42c920",
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.5rem",                     
          }}
          style={{
            ...(idioma==='kl' ? {  
            color: "#42c920",
            border: "groove 3px #42c920",
            borderRadius: "25px",          
            transition: "0.2s",         
            filter: "drop-shadow(-3px -3px 20px #42c920)",           
            width:"2.5rem"  } : ""),
          }}
          />
        </button> 
        </Stack>
      </Flex>
    </AnimatePresence>
  );
};

export default Nav;
