import { useState } from "react";
import { 
  Box, Button, FormControl, FormLabel, Input, Textarea, 
  VStack, useToast, Heading, Icon, Flex, Text 
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // Mantendo a correção do erro anterior
import { createClient } from "@supabase/supabase-js";
import { FaSatelliteDish } from "react-icons/fa"; 
import { RiAliensFill } from "react-icons/ri"; 

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const signalWave = keyframes`
  0% { transform: scale(1); opacity: 0.8; border-color: #39ff14; }
  100% { transform: scale(2); opacity: 0; border-color: transparent; }
`;

const blink = keyframes`
  0% { opacity: 1; box-shadow: 0 0 10px #39ff14; }
  50% { opacity: 0.3; box-shadow: 0 0 0px #39ff14; }
  100% { opacity: 1; box-shadow: 0 0 10px #39ff14; }
`;

// 1. Recebemos a função 'onClose' aqui nas props
const ContactForm = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('contato')
      .insert([{ 
          nome: formData.nome, 
          email: formData.email, 
          mensagem: formData.mensagem 
      }]);

    setLoading(false);

    if (error) {
      toast({
        title: "FALHA NA TRANSMISSÃO",
        description: "Interferência detectada. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "subtle"
      });
    } else {
      toast({
        title: "SINAL RECEBIDO",
        description: "Transmissão concluída. Fechando link...",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "solid",
        containerStyle: { border: "1px solid #39ff14" }
      });
      
      setFormData({ nome: "", email: "", mensagem: "" });

      // 2. Espera 2 segundos e fecha o Modal automaticamente
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    }
  };

  const arcadeGreen = "#39ff14";
  const panelBg = "rgba(20, 20, 20, 0.95)";

  return (
    <Box 
      bg={panelBg} 
      p={{ base: 6, md: 8 }} 
      borderRadius="2xl" 
      border="2px solid" 
      borderColor={arcadeGreen}
      boxShadow={`0 0 20px ${arcadeGreen}30, inset 0 0 20px ${arcadeGreen}10`}
      maxW="500px"
      mx="auto"
      position="relative"
      overflow="hidden"
    >
      <Flex direction="column" align="center" mb={6}>
        <Box position="relative" mb={4}>
          <Box
            position="absolute" top="0" left="0" right="0" bottom="0" borderRadius="full" border="2px solid" borderColor={arcadeGreen}
            animation={`${signalWave} 2s infinite`}
          />
          <Box
            position="absolute" top="-10px" left="-10px" right="-10px" bottom="-10px" borderRadius="full" border="1px solid" borderColor={arcadeGreen}
            animation={`${signalWave} 2s infinite 0.5s`} 
          />
          <Flex bg="black" borderRadius="full" p={3} border={`1px solid ${arcadeGreen}`} zIndex={2}>
            <Icon as={FaSatelliteDish} w={8} h={8} color={arcadeGreen} />
          </Flex>
        </Box>

        <Heading color={arcadeGreen} fontFamily="'Orbitron', sans-serif" size="md" textAlign="center" letterSpacing="2px" textShadow={`0 0 8px ${arcadeGreen}`}>
          UPLINK DE CONTATO
        </Heading>
        
        <Flex align="center" mt={2} gap={2}>
            <Box w="8px" h="8px" borderRadius="full" bg={arcadeGreen} animation={`${blink} 1s infinite`} />
            <Text fontSize="xs" color={arcadeGreen} fontFamily="monospace">SYSTEM ONLINE // READY</Text>
        </Flex>
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl id="nome" isRequired>
            <FormLabel color={arcadeGreen} fontFamily="monospace" fontSize="sm">IDENTIFICAÇÃO (NOME)</FormLabel>
            <Input name="nome" value={formData.nome} onChange={handleChange} placeholder="Digite sua identificação..." bg="black" borderLeft="4px solid" borderTop="1px solid" borderRight="1px solid" borderBottom="1px solid" borderColor="gray.700" color="white" fontFamily="monospace" _placeholder={{ color: "gray.600" }} _focus={{ borderColor: arcadeGreen, borderLeftColor: arcadeGreen, boxShadow: `0 0 10px ${arcadeGreen}40` }} />
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel color={arcadeGreen} fontFamily="monospace" fontSize="sm">FREQUÊNCIA DE RETORNO (EMAIL)</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" bg="black" borderLeft="4px solid" borderTop="1px solid" borderRight="1px solid" borderBottom="1px solid" borderColor="gray.700" color="white" fontFamily="monospace" _placeholder={{ color: "gray.600" }} _focus={{ borderColor: arcadeGreen, borderLeftColor: arcadeGreen, boxShadow: `0 0 10px ${arcadeGreen}40` }} />
          </FormControl>

          <FormControl id="mensagem" isRequired>
            <FormLabel color={arcadeGreen} fontFamily="monospace" fontSize="sm">PACOTE DE DADOS (MENSAGEM)</FormLabel>
            <Textarea name="mensagem" value={formData.mensagem} onChange={handleChange} placeholder="Digite o conteúdo..." bg="black" borderLeft="4px solid" borderTop="1px solid" borderRight="1px solid" borderBottom="1px solid" borderColor="gray.700" color="white" fontFamily="monospace" _placeholder={{ color: "gray.600" }} _focus={{ borderColor: arcadeGreen, borderLeftColor: arcadeGreen, boxShadow: `0 0 10px ${arcadeGreen}40` }} rows={4} />
          </FormControl>

          <Button type="submit" isLoading={loading} loadingText="TRANSMITINDO..." w="full" h="50px" bg="transparent" border="1px solid" borderColor={arcadeGreen} color={arcadeGreen} fontFamily="'Orbitron', sans-serif" fontWeight="bold" letterSpacing="2px" transition="all 0.3s" rightIcon={<Icon as={RiAliensFill} />} _hover={{ bg: arcadeGreen, color: "black", boxShadow: `0 0 20px ${arcadeGreen}`, transform: "translateY(-2px)" }} _active={{ transform: "scale(0.98)" }} mt={2}>
            INICIAR TRANSMISSÃO
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ContactForm;