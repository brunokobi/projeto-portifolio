import {
  Text,
  Flex,
  Heading,
  Stack,
  StackItem,
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
import rock from "../../assets/img/rock.png";
import profilePhoto from "../../assets/img/profile.png";
import questionImg from "../../assets/img/int-icon.png";

import { container, item } from "./animationConfig";

import { BsChevronDoubleDown, BsChevronDoubleUp } from "react-icons/bs";
import { SlideFade } from "@chakra-ui/react";
import { skills } from "./skills";
import { motion, AnimatePresence } from "framer-motion";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import kenzie from "../../assets/img/certificadoKenzie.jpg";
import certf_1 from "../../assets/img/certificado_1.png";
import certf_2 from "../../assets/img/certificado_2.png";
import certf_3 from "../../assets/img/certificado_3.png";
import certf_4 from "../../assets/img/certificado_4.png";
import certf_5 from "../../assets/img/certificado_5.png";
import certf_6 from "../../assets/img/certificado_6.png";
import certf_7 from "../../assets/img/certificado_7.png";

import { useObserver } from "./observers";
import AnimatedStars from "../../components/AnimatedStars";
import Astro from "../../components/Astro";

const About = () => {
  const skillsRef = useRef(null);
  const aboutRef = useRef(null);
  const hobbiesRef = useRef(null);
  const presentationRef = useRef(null);

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
    ];
  }, []);

  const { inViewport: presentationViewPort } = useObserver(presentationRef);
  const { inViewport: aboutViewPort } = useObserver(aboutRef);
  const { inViewport: hobbiesViewPort } = useObserver(hobbiesRef);
  const { inViewport: skillsViewPort } = useObserver(skillsRef);
  const wrapperRef = useRef(null);

  return (
    <AnimatePresence>
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
              width: "5px",
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
          <Astro wrapper={wrapperRef} p />
          <Stack
            id="top"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
          >
            <StackItem
              as={SlideFade}
              in={presentationViewPort}
              offsetX="-50%"
              transition="all 1s"
            >
              <Image src={profilePhoto} w={300} ref={presentationRef} />
            </StackItem>
            <Divider
              orientation="vertical"
              bgColor="white"
              h="100px"
              display={{ base: "none", md: "block" }}
            />
            <StackItem
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
              >
                Sobre mim
              </Text>
              <Heading fontSize={{ base: "3xl", lg: "4xl" }}>
                Bruno Kobi
              </Heading>
              <Text mb={2} fontSize={{ base: "sm", md: "md" }}>
                Apaixonado por programação, tecnologia e inovação.               
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }}>
               Sempre buscando novos conhecimentos e desafios.<br/>
               Entrando de cabeça no mundo da inteligência artificial.  <br/> 
              </Text>
            </StackItem>
          </Stack>
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
            <StackItem
              maxW="350px"
              as={ScaleFade}
              initialScale={0.6}
              in={aboutViewPort}
              transition="all 1s"
            >
              <Text
              color={"#42c920"}
                textShadow="0px 0px 10px #42c920"
                mt={{ base: 2, md: -24 }}
              >
                Educação
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} mb={2}>
              Atualmente sou aluno de mestrado no IFES em computação aplicada na linha de Inteligência Artificial.
               Me formei 2004 como técnico em informática no IFES , mais acabei não seguindo na área. Desde 2018, decidi focar totalmente na área de desenvolvimento de software,
              deixando um cargo de 14 anos na área administrativa. Me formei em 2020, como Bacharel de Sistemas de Informação na Unisales.
              </Text>             
            </StackItem>

            <StackItem
              mt={-24}
              textAlign="center"
              as={SlideFade}
              in={aboutViewPort}
              offsetX="50%"
              transition="all 1s"
            >             
              <Image src={questionImg} w={300} ref={aboutRef} />
            </StackItem>
          </Stack>
          <Box
            as={motion.div}
            whileHover={{ scale: 1.5 }}
            whileTap={{
              scale: 0.8,
              borderRadius: "100%",
            }}
          >
            <Link href="#hobbies">
              <Icon
                as={BsChevronDoubleDown}
                fontSize={24}
                my={1}
                color="#42c920"
              />
            </Link>
          </Box>
          <Stack
            id="hobbies"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            alignItems="center"
            w="100%"
            maxW={{ base: "100%", md: "700px" }}
          >
            <StackItem
              textAlign="center"
              as={SlideFade}
              in={hobbiesViewPort}
              offsetX="-50%"
              transition="all 1s"
            >
             
              <Image src={rock} w={300} ref={hobbiesRef} />
            </StackItem>
            <StackItem
              maxW="350px"
              as={SlideFade}
              in={hobbiesViewPort}
              offsetX="50%"
              transition="all 1s"
            >
             <Text
              color={"#42c920"}
                textShadow="0px 0px 10px #42c920"
                mt={{ base: 3, md: -24 }}
              >
               Experiência
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} mb={2}>
              <b>Assistente de Programação II </b><br/>
              Ambipar Response Orbitgeo Ltda <br/>              
              set de 2021 - o momento · 1 ano 2 meses  <br/>              
              Competências: Desenvolvimento de front-end · HTML · CSS · API REST · Git · 
              Metodologias Agile · MySQL · PHP · React.js · TypeScript · JavaScript · PostgreSQL
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} mb={2}>         
              <b>Analista de desenvolvimento de software</b><br/>
              Directy · Tempo integral <br/>
              nov de 2020 - set de 2021 · 11 meses <br/>
              Competências: Desenvolvimento de front-end · HTML · CSS · API REST · Node.js · Git · Metodologias Agile · MySQL · React.js · react native · TypeScript · JavaScript · expo
                            </Text>
              <Text fontSize={{ base: "xs", md: "sm" }}>               
              <b>Estagiário de sistemas da informação </b><br/>
              Ecosoft Consultoria E Softwares Ambientais Ltda <br/>
              ago de 2019 - jan de 2020 · 6 meses <br/>
              Competências: Desenvolvimento de front-end · HTML · CSS · API REST · JavaScript · PostgreSQL · AngularJS
              </Text>
            </StackItem>
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
            <StackItem>
              <Heading
                fontSize={{ base: "3xl", lg: "4xl" }}
                textShadow="0px 0px 10px #42c920"
                textAlign="center"
              >
                Skills
              </Heading>
            </StackItem>
            <StackItem>
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

                    <Text display={{ base: "none", md: "block" }}>{label}</Text>
                  </WrapItem>
                ))}
              </Wrap>
            </StackItem>
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
            <StackItem>
              <Heading
                fontSize={{ base: "3xl", lg: "4xl" }}
                textShadow="0px 0px 10px #42c920"
                textAlign="center"
              >
                Qualificações
              </Heading>
            </StackItem>
            <StackItem maxW={{ base: "350px", md: "700px" }} zIndex="999">
              <Carousel autoPlay infiniteLoop={true}>
                {certifications.map((certfImg, i) => (
                  <div key={i}>
                    <img src={certfImg} alt="certification" />
                  </div>
                ))}
              </Carousel>
            </StackItem>
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
