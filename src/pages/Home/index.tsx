import { Flex, Heading, SlideFade, Stack } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useCallback } from "react";
import useTypewriter from "../../hooks/useTypewriter";
import profile from "../../assets/img/home-animation-removed.gif";

import VideoBackground from "../../components/VideoBackground";
import BigBangLoader from "../../components/BigBangLoader";
import GlobeBackground from "../../components/GlobeBackground";
import IconsBackground from "../../components/IconsBackground";
import { useIntl } from "react-intl";
import falar from "../../components/TextAudio";

const Home = () => {
  const intl = useIntl();

  const phrases = useMemo(
    () => [intl.formatMessage({ id: "frase_1" }), intl.formatMessage({ id: "frase_2" })],
    [intl]
  );

  const typedPhrase = useTypewriter(phrases);

  const falarBoasVindas = useCallback(() => falar(intl.formatMessage({ id: "ola_mundo" })), [intl]);
  const falarEuSou = useCallback(() => falar(intl.formatMessage({ id: "eu_sou" })), [intl]);
  const falarNome = useCallback(() => falar(intl.formatMessage({ id: "meunome" })), [intl]);
  const falarFrases = useCallback(() => falar(phrases.join(" ")), [phrases]);

  useEffect(() => {
    const timer = setTimeout(() => {
      falar(
        intl.formatMessage({ id: "ola_mundo" }) +
          intl.formatMessage({ id: "eu_sou" }) +
          intl.formatMessage({ id: "meunome" }) +
          phrases.join(" ")
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [intl, phrases]);

  return (
    <AnimatePresence>
      <VideoBackground />
      <BigBangLoader />
      <GlobeBackground />
      <IconsBackground />

      <Flex
        minH="100vh"
        w={{ base: "90%", sm: "100%", md: "60%", lg: "100%" }}
        direction="column"
        justify="center"
        align="center"
        position="relative"
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        margin="3%"
      >
        <Stack
          direction={{ base: "column", sm: "column", md: "row", lg: "row" }}
          spacing={5}
          align="center"
        >
          <Stack
            as={SlideFade}
            in={true}
            offsetX="-50%"
            transition="all 1s"
            position="relative"
            zIndex={10}
          >
            <Image src={profile} w={{ base: 250, md: 300 }} alt="Bruno Kobi" />
          </Stack>

          <Stack spacing={1} position="relative" zIndex={10}>
            <Flex alignItems="flex-end">
              <Heading
                fontSize={{ base: "xl", md: "5xl" }}
                fontWeight={300}
                mb={{ md: -1, lg: -2 }}
                onMouseOver={falarBoasVindas}
                textShadow="0px 0px 10px rgb(0,0,0)"
              >
                {intl.formatMessage({ id: "ola_mundo" })},&nbsp;
              </Heading>
              <Heading
                fontSize={{ base: "md", md: "xl" }}
                fontWeight={300}
                onMouseOver={falarEuSou}
                textShadow="0px 0px 10px rgb(0,0,0)"
              >
                {intl.formatMessage({ id: "eu_sou" })}
              </Heading>
            </Flex>

            <Heading
              display="flex"
              fontSize={{ base: "3xl", sm: "3xl", md: "3xl", lg: "5xl", xl: "6xl" }}
              onMouseOver={falarNome}
              textShadow="0px 0px 10px #42c920"
            >
              {intl.formatMessage({ id: "meunome" })}
            </Heading>

            <Heading
              fontSize={{ base: "md", md: "3xl" }}
              fontWeight={300}
              color="whiteAlpha.600"
              textShadow="0px 0px 10px rgb(0,0,0)"
            >
              {"<dev/>"}
            </Heading>

            <Heading
              fontSize={{ base: "sm", md: "xl" }}
              fontWeight={300}
              onMouseOver={falarFrases}
              textShadow="0px 0px 10px rgb(0,0,0)"
            >
              <span style={{ borderRight: "2px solid #42c920" }}>{typedPhrase}</span>
            </Heading>
          </Stack>
        </Stack>
      </Flex>
    </AnimatePresence>
  );
};

export default Home;
