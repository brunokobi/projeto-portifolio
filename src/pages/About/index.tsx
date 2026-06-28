import {
  Text,
  Flex,
  Heading,
  Stack,
  Image,
  Divider,
  Icon,
  Box,
  Link,
  ScaleFade,
  Wrap,
  WrapItem,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useMemo, useRef, useState } from "react";
import rock from "../../assets/img/rock.png"; // Imagem usada na seção de experiência
import profilePhoto from "../../assets/img/profile.png"; // Foto de perfil do usuário
import questionImg from "../../assets/img/questions.png"; // Ícone usado na seção "Sobre mim"

import { container, item } from "./animationConfig"; // Configurações de animação

import { BsChevronDoubleDown, BsChevronDoubleUp } from "react-icons/bs"; // Ícones de seta
import { SlideFade } from "@chakra-ui/react"; // Animação de transição
import { skills } from "./skills"; // Lista de habilidades
import { motion, AnimatePresence } from "framer-motion"; // Biblioteca para animações avançadas

import falar from "../../components/TextAudio"; // Função para síntese de voz

import kenzie from "../../assets/img/certificadoKenzie.jpg"; // Certificados
import certf_1 from "../../assets/img/certificado_1.png";
import certf_2 from "../../assets/img/certificado_2.png";
import certf_3 from "../../assets/img/certificado_3.png";
import certf_4 from "../../assets/img/certificado_4.png";
import certf_5 from "../../assets/img/certificado_5.png";
import certf_9 from "../../assets/img/certificado_6.png";
import certf_10 from "../../assets/img/certificado_7.png";
import certf_8 from "../../assets/img//cert_form_mla.jpg";
import certf_6 from "../../assets/img//cert_form_qa.jpg";
import certf_7 from "../../assets/img/cert_form_npl.jpg";

import { useObserver } from "./observers"; // Hook personalizado para observação de elementos no viewport
import AnimatedStars from "../../components/AnimatedStars"; // Efeito de estrelas animadas
import { useIntl } from "react-intl"; // Biblioteca para internacionalização

const About = () => {
  const intl = useIntl(); // Objeto para acessar mensagens traduzidas
  const skillsRef = useRef(null); // Referência para a seção de habilidades
  const aboutRef = useRef(null); // Referência para a seção "Sobre mim"
  const experienciaRef = useRef(null); // Referência para a seção de experiência
  const presentationRef = useRef(null); // Referência para a seção de apresentação

  const [certIdx, setCertIdx] = useState(0);

  // Lista de certificados
  const certifications = useMemo(() => {
    return [
      kenzie,
      certf_1,
      certf_2,
      certf_3,
      certf_4,
      certf_5,
      certf_6,
      certf_7,
      certf_8,
      certf_9,
      certf_10,
    ];
  }, []);

  // Verifica se as seções estão visíveis no viewport
  const { inViewport: presentationViewPort } = useObserver(presentationRef);
  const { inViewport: aboutViewPort } = useObserver(aboutRef);
  const { inViewport: experienciaViewPort } = useObserver(experienciaRef);
  const { inViewport: skillsViewPort } = useObserver(skillsRef);
  const wrapperRef = useRef(null); // Referência para o container principal

  return (
    <AnimatePresence>
      {/* Container principal com animação de entrada e saída */}
      <Box as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Flex
          gap={5}
          h="100vh"
          w="100%"
          align="center"
          overflowY="auto"
          py={24}
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
          {/* Seção de apresentação */}
          <Stack
            id="top"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
          >
            {/* Foto de perfil */}
            <Box as={SlideFade as any} in={presentationViewPort} offsetX="-50%" transition="all 1s">
              <Image src={profilePhoto} w={300} ref={presentationRef} />
            </Box>
            <Divider
              orientation="vertical"
              bgColor="white"
              h="100px"
              display={{ base: "none", md: "block" }}
            />
            {/* Texto "Sobre mim" */}
            <Box
              maxW="350px"
              as={SlideFade as any}
              in={presentationViewPort}
              offsetY="-50%"
              transition="all 1s"
            >
              <Text
                color={"#42c920"}
                textShadow="0px 0px 10px #42c920"
                mt={{ base: 2, md: -24 }}
                onMouseOver={() => falar(intl.formatMessage({ id: "sobre_mim" }))}
              >
                {intl.formatMessage({ id: "sobre_mim" })}
              </Text>
              <Heading
                fontSize={{ base: "3xl", lg: "4xl" }}
                onMouseOver={() => falar("Bruno Kobi")}
              >
                Bruno Kobi
              </Heading>
              {/* Descrição sobre o usuário */}
              <Text
                mb={2}
                fontSize={{ base: "sm", md: "md" }}
                onMouseOver={() => falar(intl.formatMessage({ id: "sobre1" }))}
              >
                {intl.formatMessage({ id: "sobre1" })}
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                onMouseOver={() =>
                  falar(intl.formatMessage({ id: "sobre2" }) + intl.formatMessage({ id: "sobre3" }))
                }
              >
                {intl.formatMessage({ id: "sobre2" })}
                <br />
                {intl.formatMessage({ id: "sobre3" })}
              </Text>
            </Box>
          </Stack>
          {/* Ícone de navegação para a próxima seção */}
          <Box
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
          >
            <Link href="#about">
              <Icon as={BsChevronDoubleDown} fontSize={24} my={1} color="#42c920" />
            </Link>
          </Box>

          <Stack
            id="about"
            direction={{ base: "column-reverse", md: "row" }}
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
          >
            <Box
              maxW="350px"
              as={ScaleFade as any}
              initialScale={0.6}
              in={aboutViewPort}
              transition="all 1s"
            >
              <Text
                color={"#42c920"}
                textShadow="0px 0px 10px #42c920"
                mt={{ base: 2 }}
                onMouseOver={() => falar(intl.formatMessage({ id: "educacao" }))}
              >
                {intl.formatMessage({ id: "educacao" })}
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                mb={2}
                onMouseOver={() => falar(intl.formatMessage({ id: "educacao1" }))}
              >
                {intl.formatMessage({ id: "educacao1" })}
              </Text>
            </Box>

            <Box
              mt={-24}
              textAlign="center"
              as={SlideFade as any}
              in={aboutViewPort}
              offsetX="50%"
              transition="all 1s"
            >
              <Image src={questionImg} w={700} ref={aboutRef} />
            </Box>
          </Stack>

          <Box
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
          >
            <Link href="#experiencia">
              <Icon as={BsChevronDoubleDown} fontSize={24} my={1} color="#42c920" />
            </Link>
          </Box>
          <Stack
            id="experiencia"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
          >
            <Box
              textAlign="center"
              as={SlideFade as any}
              in={experienciaViewPort}
              offsetX="-50%"
              transition="all 1s"
            >
              <Image src={rock} w={400} ref={experienciaRef} />
            </Box>
            <Box
              maxW="350px"
              as={SlideFade as any}
              in={experienciaViewPort}
              offsetX="50%"
              transition="all 1s"
            >
              <Text color={"#42c920"} textShadow="0px 0px 10px #42c920" mt={{ base: 3 }}>
                {intl.formatMessage({ id: "experiencia" })}
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }} mb={4} mt={2}>
                <b> {intl.formatMessage({ id: "experiencia5t" })} </b>
                <br />
                {intl.formatMessage({ id: "experiencia5e" })}
                <br />
                {intl.formatMessage({ id: "experiencia5d" })} <br />
                {intl.formatMessage({ id: "competencias" })}: React · Node.js · IA · LangChain ·
                Claude · Chatwoot · n8n · Automação · TypeScript · JavaScript
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }} mb={4} mt={2}>
                <b> {intl.formatMessage({ id: "experiencia4t" })} </b>
                <br />
                {intl.formatMessage({ id: "experiencia4e" })}
                <br />
                {intl.formatMessage({ id: "experiencia4d" })} <br />
                {intl.formatMessage({ id: "competencias" })}: React · TypeScript · ArcGIS (Esri) ·
                Laravel · PHP · PostgreSQL · Scrum
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }} mb={4} mt={2}>
                <b> {intl.formatMessage({ id: "experiencia1t" })} </b>
                <br />
                {intl.formatMessage({ id: "experiencia1e" })}
                <br />
                {intl.formatMessage({ id: "experiencia1d" })} <br />
                {intl.formatMessage({ id: "competencias" })}: React · TypeScript · ArcGIS (Esri) ·
                API REST · Git · Scrum
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }} mb={4}>
                <b>{intl.formatMessage({ id: "experiencia2t" })}</b>
                <br />
                {intl.formatMessage({ id: "experiencia2e" })}
                <br />
                {intl.formatMessage({ id: "experiencia2d" })}
                <br />
                {intl.formatMessage({ id: "competencias" })}: Node.js · MySQL · React · React Native
                · TypeScript · Expo · Scrum
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }} mb={4}>
                <b>{intl.formatMessage({ id: "experiencia3t" })} </b>
                <br />
                {intl.formatMessage({ id: "experiencia3e" })}
                <br />
                {intl.formatMessage({ id: "experiencia3d" })}
                <br />
                {intl.formatMessage({ id: "competencias" })}: AngularJS · PostgreSQL · Leaflet ·
                Scrum
              </Text>

              <Text fontSize={{ base: "xs", md: "sm" }}>
                <b>{intl.formatMessage({ id: "experiencia6t" })} </b>
                <br />
                {intl.formatMessage({ id: "experiencia6e" })}
                <br />
                {intl.formatMessage({ id: "experiencia6d" })}
                <br />
                {intl.formatMessage({ id: "competencias" })}: CodeIgniter · PHP · MySQL · HTML · CSS
                · JavaScript
              </Text>
            </Box>
          </Stack>

          <Box
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
          >
            <Link href="#skills">
              <Icon as={BsChevronDoubleDown} fontSize={24} my={1} color="#42c920" />
            </Link>
          </Box>

          <Stack
            spacing={8}
            id="skills"
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
          >
            <div>
              <Heading
                fontSize={{ base: "3xl", lg: "4xl" }}
                textShadow="0px 0px 10px #42c920"
                textAlign="center"
                onMouseOver={() => falar(intl.formatMessage({ id: "skills" }))}
              >
                {intl.formatMessage({ id: "skills" })}
              </Heading>
            </div>
            <div>
              <Wrap
                ref={skillsRef}
                spacing={{ base: 2, md: 6 }}
                as={motion.ul}
                variants={container}
                initial="hidden"
                animate={skillsViewPort ? "visible" : ""}
                w="100%"
                maxW={{ base: "100%", md: "700px" }}
              >
                {skills.map(({ label, icon }, i) => (
                  <WrapItem
                    key={i}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    as={motion.li}
                    variants={item}
                    p={2}
                    whileHover={{
                      color: "#42c920",
                      scale: 1.2,
                      textShadow: "-1.5px -1.5px #42c920",
                    }}
                    whileTap={{
                      color: "#42c920",
                      scale: 1.2,
                      textShadow: "-1.5px -1.5px #42c920",
                    }}
                  >
                    <Icon as={icon} fontSize={{ base: 36, md: 28 }} rounded="full" />

                    <Text display={{ base: "none", md: "block" }} onMouseOver={() => falar(label)}>
                      {label}
                    </Text>
                  </WrapItem>
                ))}
              </Wrap>
            </div>
          </Stack>
          <Box
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
            mt={6}
          >
            <Link href="#qualifications">
              <Icon as={BsChevronDoubleDown} fontSize={24} my={1} color="#42c920" />
            </Link>
          </Box>

          <Stack
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "350px", md: "700px" }}
            id="qualifications"
            spacing={12}
          >
            <div>
              <Heading
                fontSize={{ base: "3xl", lg: "4xl" }}
                textShadow="0px 0px 10px #42c920"
                textAlign="center"
                onMouseOver={() => falar(intl.formatMessage({ id: "quali" }))}
              >
                {intl.formatMessage({ id: "quali" })}
              </Heading>
            </div>
            <Box position="relative" w="100%" maxW="500px" mx="auto">
              <Image
                src={certifications[certIdx]}
                alt={`Certificado ${certIdx + 1}`}
                w="100%"
                borderRadius="md"
                border="1px solid"
                borderColor="whiteAlpha.200"
                loading="lazy"
              />
              <HStack
                position="absolute"
                bottom={2}
                left={0}
                right={0}
                justify="center"
                spacing={2}
              >
                {certifications.map((_, i) => (
                  <Box
                    key={i}
                    as="button"
                    w={certIdx === i ? "20px" : "8px"}
                    h="8px"
                    borderRadius="full"
                    bg={certIdx === i ? "#42c920" : "whiteAlpha.400"}
                    transition="all 0.2s"
                    onClick={() => setCertIdx(i)}
                  />
                ))}
              </HStack>
              <HStack justify="space-between" mt={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="#42c920"
                  _hover={{ bg: "whiteAlpha.100" }}
                  onClick={() =>
                    setCertIdx((i) => (i - 1 + certifications.length) % certifications.length)
                  }
                >
                  ← Anterior
                </Button>
                <Text fontSize="xs" color="whiteAlpha.600">
                  {certIdx + 1} / {certifications.length}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  color="#42c920"
                  _hover={{ bg: "whiteAlpha.100" }}
                  onClick={() => setCertIdx((i) => (i + 1) % certifications.length)}
                >
                  Próximo →
                </Button>
              </HStack>
            </Box>
          </Stack>
          <Box
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
          >
            <Link href="#top">
              <Icon as={BsChevronDoubleUp} fontSize={24} my={1} color="#42c920" />
            </Link>
          </Box>
          <AnimatedStars />
        </Flex>
      </Box>
    </AnimatePresence>
  );
};

export default About;
