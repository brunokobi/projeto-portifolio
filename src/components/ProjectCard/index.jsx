import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  Text,
  Image,
  useColorModeValue,
  Box,
  StackItem,
  SlideFade,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useObserver } from "../../pages/About/observers";

const ProjectCard = ({
  link,
  title,
  description,
  tags,
  demo,
  code,
  img,
  i,
}) => {
  const cardRef = useRef(null);
  const falar = (text) => {   
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.rate = 0.8;
    let som = localStorage.getItem('Audio');
    if (som === 'on') {
      synth.speak(utterThis);  
    }    
  }

  const { inViewport: cardViewport } = useObserver(cardRef);

  return (
    <Center
      py={6}
      as={SlideFade}
      ref={cardRef}
      {...(i % 2 ? { offsetX: 50 } : { offsetX: -50 })}
      // offsetY={50}
      in={cardViewport}
      transition={`all 1s`}
      zIndex={1}
      position="relative"
    >
      <Stack
        borderRadius="lg"
        w={{ sm: "350px", md: "640px" }}
        direction="column"
        bg={useColorModeValue("transparent", "gray.900")}
        boxShadow={"2xl"}
        padding={1}
        spacing={3}
        justify="center"
        textAlign="center"
      >
        <StackItem>
          <Heading fontSize={"2xl"} fontFamily={"body"}
          onMouseOver={() => falar(title)}
          >
            {title}
          </Heading>
        </StackItem>
        <StackItem>
          <Flex flex={1} bg="blue.200">
            {link ? (
              <Box
                as={"iframe"}
                src={link}
                width="100%"
                overflow="hidden"
                h={{ base: "200px", md: "300px" }}
                title={title}
                scrolling="no"
              />
            ) : (
              // <iframe
              //   src={link}
              //   width="100%"
              //   height="300px"
              //   frameborder="0"
              //   scrolling="no"
              //   frameborder="0"
              // />
              <Image src={img} alt={title} width="100%" height="100%"/>
            )}
          </Flex>
        </StackItem>
        <Stack
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            textAlign={"center"}
            color={useColorModeValue("rgb(196, 196, 196)", "gray.400")}
            px={1}
            fontSize="sm"
            onMouseOver={() => falar(description)}
          >
            {description}
          </Text>
          <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
            {tags &&
              tags.map((tag, i) => (
                <Badge
                  key={i}
                  px={2}
                  py={1}
                  bg="transparent"
                  color="rgb(196, 196, 196)"
                  textShadow="0.5px 0.5px #ff0050, -0.5px -0.5px #42c920"
                  fontWeight={"400"}
                  as={motion.div}
                  whileHover={{
                    scale: 1.4,
                  }}
                  whileTap={{
                    scale: 1.4,
                  }}
                >
                  {tag}
                </Badge>
              ))}
          </Stack>

          <Stack
            width={"100%"}
            mt={"2rem"}
            direction={"row"}
            padding={2}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Button
              p={0}
              flex={1}
              transform="scale(0.8)"
              height="30px"
              fontSize={"sm"}
              rounded={"full"}
              maxW="100px"
              variant="outline"
              bg={"transparent"}
              borderColor="#42c920"
              color={"white"}
              _hover={{
                transform: "scale(1)",
              }}
              boxShadow={
                "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
              }
              onClick={() => window.open(code, "_blank")}
            >
              GitHub
            </Button>
            <Button
              flex={1}
              height="30px"
              fontSize={"sm"}
              maxW="100px"
              color={"white"}
              rounded={"full"}
              variant="outline"
              bg={"transparent"}
              borderColor="#42c920"
              transform="scale(0.8)"
              p={0}
              boxShadow={
                "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
              }
              _hover={{
                transform: "scale(1)",
              }}
              onClick={() => window.open(demo, "_blank")}
            >
              Demo
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Center>
  );
};

export default ProjectCard;
