import { Flex, Heading, SlideFade, Stack} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
import profile from "../../assets/img/home-animation-removed.gif";


import IconsBackground from "../../components/IconsBackground";
import {useIntl} from 'react-intl'
import falar from "../../components/TextAudio";




const Home = () => {
const intl = useIntl();
setTimeout(() => {
  falar(
    intl.formatMessage({id: 'ola_mundo'})+
    intl.formatMessage({id: 'eu_sou'})+
    intl.formatMessage({id: 'meunome'})+
    intl.formatMessage({id: 'frase_1'})+
    intl.formatMessage({id: 'frase_2'})
  )
}, 1000); 


  return (
    <AnimatePresence>        
      <Flex
        minH="100vh"
        w={{ base: "90%", md: "60%", lg: "100%", sm: "100%" }}
        direction="column"
        justify="center"
        align="center"
        position="relative"
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        margin={'3%'}
      >
         
        <Stack
          direction={{ base: "column", md: "row", lg: "row",sm:"column" }}
          spacing={5}
          display="flex"
          align="center"
        >
          <IconsBackground />
          <div
            as={SlideFade}
            in={true}
            offsetX="-50%"
            transition="all 1s"
          >
            <Image src={profile} w={{ base: 250, md: 300 }} />
          </div>

          <div>
            <Stack spacing={1}>
              <div display="flex" alignItems="flex-end">
                <Heading
                  position="relative"
                  zIndex="999"
                  fontSize={{ base: "xl", md: "5xl" }}
                  fontWeight={300}
                  mb={{ md: -1, lg: -2 }}
                  onMouseOver={() => falar(intl.formatMessage({id: 'ola_mundo'}))}
                >                
                  {/* tradução texto */}
                  {intl.formatMessage({id: 'ola_mundo'})},&nbsp;

                </Heading>
                <Heading
                  fontSize={{ base: "md", md: "xl" }}
                  fontWeight={300}
                  variant="span"
                  position="relative"
                  zIndex="999"
                  onMouseOver={() => falar(intl.formatMessage({id: 'eu_sou'}))}
                >
                   {/* tradução texto */}
                  {intl.formatMessage({id: 'eu_sou'})}                
                </Heading>
              </div>

              <div>
                <Heading
                  position="relative"
                  zIndex="999"
                  display="flex"
                  textShadow={{
                    base: "0px 0px 20px #42c920",
                    md: "0px 0px 8px #42c920",
                    lg: "0px 0px 10px #42c920",
                  }}
                  fontSize={{ base: "3xl", md: "3xl", lg: "5xl",sm:"3xl",xl:"6xl" }}
                  onMouseOver={() => falar(intl.formatMessage({id: 'meunome'}))}
                >
                   {intl.formatMessage({id: 'meunome'})}      
                  <Typewriter
                    options={{
                      strings: [""],
                      autoStart: true,
                      loop: true,
                    }}
                  />
                </Heading>
              </div>

              <div>
                <Heading
                  position="relative"
                  zIndex="999"
                  fontSize={{ base: "md", md: "3xl" }}
                  fontWeight={300}
                  color="whiteAlpha.600"
                >
                  {"<dev/>"}
                </Heading>
              </div>

              <div>
                <Heading
                  fontSize={{ base: "sm", md: "xl" }}
                  fontWeight={300}
                  position="relative"
                  zIndex="999"
                  onMouseOver={() => falar(intl.formatMessage({id: 'frase_1'})
                  +intl.formatMessage({id: 'frase_2'})
                  )}
                >                 
                  <Typewriter
                    options={{
                      strings: [                        
                        intl.formatMessage({id: 'frase_1'}),
                        intl.formatMessage({id: 'frase_2'}),
                      ],
                      autoStart: true,
                      loop: true,
                    }}
                  />
                </Heading>
              </div>
            </Stack>
          </div>
        </Stack>       
      </Flex>
    </AnimatePresence>
   
  );
};

export default Home;
