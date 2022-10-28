import { Breadcrumb, Flex } from "@chakra-ui/react";
import { sections } from "./sections";
import { AnimatePresence } from "framer-motion";
import usa from "../../assets/img/usa.png";
import brazil from "../../assets/img/brazil.png";
import spain from "../../assets/img/spain.png";
import france from "../../assets/img/france.png";
import germany from "../../assets/img/germany.png";
import china from "../../assets/img/china.png";
import { Image } from "@chakra-ui/react";
import {useIntl} from 'react-intl'


import Item from "./Item";


const Nav = () => {
  const intl = useIntl();
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
        <Breadcrumb
          fontWeight="medium"
          fontSize="sm"
          spacing={{ base: 4, md: 8 }}
          separator=""
        >
          {sections.map(({ label, url, icon }, i) => (
            <Item {...{ label, url, icon }} key={i} />
          ))}
        </Breadcrumb>

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'pt' }));
          window.location.reload();}}>
          <Image src={brazil} w={{ base: 25, md:25}} margin={'1'} title= {intl.formatMessage({id: 'pt'})}/>
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'en' }));
          window.location.reload();}}>
          <Image src={usa} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'en'})}/>
        </button> 

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'es' }));
          window.location.reload();}}>
          <Image src={spain} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'es'})}/>
        </button> 

        <button  onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'fr' }));
          window.location.reload();}}>
          <Image src={france} w={{ base: 25, md: 25 }} margin={'1'}title= {intl.formatMessage({id: 'fr'})}/>
        </button>

        <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'de' }));
          window.location.reload();}}>
          <Image src={germany} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'de'})}/>
          </button> 

          <button onClick={() => {localStorage.setItem("i18nConfig", JSON.stringify({ selectedLang: 'zh' }));
          window.location.reload();}}>
          <Image src={china} w={{ base: 25, md: 25 }} margin={'1'} title= {intl.formatMessage({id: 'zh'})}/>
        </button> 
           

      </Flex>
    </AnimatePresence>
  );
};

export default Nav;
