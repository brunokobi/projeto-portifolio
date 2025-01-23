
import {
  Text,
  Flex,
  Heading,
  Stack,
  div,
  Image,
  Divider,
  Icon,
  Box,
  Link,
  ScaleFade,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMemo, useRef } from "react";
import rock from "../../assets/img/rock.png"; // Imagem usada na seção de experiência
import profilePhoto from "../../assets/img/profile.png"; // Foto de perfil do usuário
import questionImg from "../../assets/img/int-icon.png"; // Ícone usado na seção "Sobre mim"

import { container, item } from "./animationConfig"; // Configurações de animação

import { BsChevronDoubleDown, BsChevronDoubleUp } from "react-icons/bs"; // Ícones de seta
import { SlideFade } from "@chakra-ui/react"; // Animação de transição
import { skills } from "./skills"; // Lista de habilidades
import { motion, AnimatePresence } from "framer-motion"; // Biblioteca para animações avançadas

import "react-responsive-carousel/lib/styles/carousel.min.css"; // Estilo do carrossel
import { Carousel } from "react-responsive-carousel"; // Carrossel para exibição de certificados
import falar from "../../components/TextAudio"; // Função para síntese de voz

import kenzie from "../../assets/img/certificadoKenzie.jpg"; // Certificados
import certf_1 from "../../assets/img/certificado_1.png";
import certf_2 from "../../assets/img/certificado_2.png";
import certf_3 from "../../assets/img/certificado_3.png";
import certf_4 from "../../assets/img/certificado_4.png";
import certf_5 from "../../assets/img/certificado_5.png";
import certf_6 from "../../assets/img/certificado_6.png";
import certf_7 from "../../assets/img/certificado_7.png";
import certf_8 from "../../assets/img//cert_form_mla.jpg";
import certf_9 from "../../assets/img//cert_form_qa.jpg";
import certf_10 from "../../assets/img///cert_form_npl.jpg";

import { useObserver } from "./observers"; // Hook personalizado para observação de elementos no viewport
import AnimatedStars from "../../components/AnimatedStars"; // Efeito de estrelas animadas
import { useIntl } from "react-intl"; // Biblioteca para internacionalização

const About = () => {
  const intl = useIntl(); // Objeto para acessar mensagens traduzidas
  const skillsRef = useRef(null); // Referência para a seção de habilidades
  const aboutRef = useRef(null); // Referência para a seção "Sobre mim"
  const experienciaRef = useRef(null); // Referência para a seção de experiência
  const presentationRef = useRef(null); // Referência para a seção de apresentação

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
      <Box
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
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
            <div
              as={SlideFade}
              in={presentationViewPort}
              offsetX="-50%"
              transition="all 1s"
            >
              <Image src={profilePhoto} w={300} ref={presentationRef} />
            </div>
            <Divider
              orientation="vertical"
              bgColor="white"
              h="100px"
              display={{ base: "none", md: "block" }}
            />
            {/* Texto "Sobre mim" */}
            <div
              maxW="350px"
              as={SlideFade}
              in={presentationViewPort}
              offsetY="-50%"
              transition="all 1s"
            >
              <Text
                color={"#42c920"}
                textShadow="0px 0px 10px #42c920"
                mt={{ base: 2, md: -24 }}
                onMouseOver={() =>
                  falar(intl.formatMessage({ id: "sobre_mim" }))
                }
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
                onMouseOver={() =>
                  falar(intl.formatMessage({ id: "sobre1" }))
                }
              >
                {intl.formatMessage({ id: "sobre1" })}
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                onMouseOver={() =>
                  falar(
                    intl.formatMessage({ id: "sobre2" }) +
                      intl.formatMessage({ id: "sobre3" })
                  )
                }
              >
                {intl.formatMessage({ id: "sobre2" })}
                <br />
                {intl.formatMessage({ id: "sobre3" })}
              </Text>
            </div>
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
              <Icon
                as={BsChevronDoubleDown}
                fontSize={24}
                my={1}
                color="#42c920"
              />
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
            <div
              maxW="350px"
              as={ScaleFade}
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
              <Text fontSize={{ base: "xs", md: "sm" }} mb={2}
              onMouseOver={() => falar(intl.formatMessage({ id: "educacao1" }))}
              >
              {intl.formatMessage({ id: "educacao1" })}
              </Text>             
            </div>

            <div
              mt={-24}
              textAlign="center"
              as={SlideFade}
              in={aboutViewPort}
              offsetX="50%"
              transition="all 1s"
            >             
              <Image src={questionImg} w={300} ref={aboutRef} />
            </div>
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
              <Icon
                as={BsChevronDoubleDown}
                fontSize={24}
                my={1}
                color="#42c920"
              />
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
            <div
              textAlign="center"
              as={SlideFade}
              in={experienciaViewPort}
              offsetX="-50%"
              transition="all 1s"
            >
             
              <Image src={rock} w={300} ref={experienciaRef} />
            </div>
            <div
              maxW="350px"
              as={SlideFade}
              in={experienciaViewPort}
              offsetX="50%"
              transition="all 1s"
            >
             <Text
              color={"#42c920"}
                textShadow="0px 0px 10px #42c920"
                mt={{ base: 3 }}
              >
                {intl.formatMessage({ id: "experiencia" })}
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} mb={4} mt={2}>
              <b> {intl.formatMessage({ id: "experiencia1t" })} </b><br/>
              {intl.formatMessage({ id: "experiencia1e" })}<br/>              
              {intl.formatMessage({ id: "experiencia1d" })} <br/>              
              {intl.formatMessage({ id: "competencias" })}: Desenvolvimento de front-end · HTML · CSS · API REST · Git · 
              Metodologias Agile · MySQL · PHP · React.js · TypeScript · JavaScript · PostgreSQL
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} mb={4}>         
              <b>{intl.formatMessage({ id: "experiencia2t" })}</b><br/>
              {intl.formatMessage({ id: "experiencia2e" })}<br/>
              {intl.formatMessage({ id: "experiencia2d" })}<br/>
              {intl.formatMessage({ id: "competencias" })}: Desenvolvimento de front-end · HTML · CSS · API REST · Node.js · Git · Metodologias Agile · MySQL · React.js · react native · TypeScript · JavaScript · expo
                            </Text>
              <Text fontSize={{ base: "xs", md: "sm" }}>               
              <b>{intl.formatMessage({ id: "experiencia3t" })} </b><br/>
              {intl.formatMessage({ id: "experiencia3e" })}<br/>
              {intl.formatMessage({ id: "experiencia3d" })}<br/>
              {intl.formatMessage({ id: "competencias" })}: Desenvolvimento de front-end · HTML · CSS · API REST · JavaScript · PostgreSQL · AngularJS
              </Text>
            </div>
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
              <Icon
                as={BsChevronDoubleDown}
                fontSize={24}
                my={1}
                color="#42c920"
              />
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
                    <Icon
                      as={icon}
                      fontSize={{ base: 36, md: 28 }}
                      rounded="full"
                    />

                    <Text display={{ base: "none", md: "block" }}
                    onMouseOver={() => falar(label)}
                    >{label}</Text>
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
              <Icon
                as={BsChevronDoubleDown}
                fontSize={24}
                my={1}
                color="#42c920"
              />
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
            <div maxW={{ base: "350px", md: "700px" }} zIndex="999">
              <Carousel autoPlay infiniteLoop={true}>
                {certifications.map((certfImg, i) => (
                  <div key={i}>
                    <img src={certfImg} alt="certification" />
                  </div>
                ))}
              </Carousel>
            </div>
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
              <Icon
                as={BsChevronDoubleUp}
                fontSize={24}
                my={1}
                color="#42c920"
              />
            </Link>
          </Box>
          <AnimatedStars />
        </Flex>
      </Box>
    </AnimatePresence>
  );
};

export default About;
