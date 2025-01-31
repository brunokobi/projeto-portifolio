// teste de ia usando modelo de mistral
import { useState } from "react";
import axios from "axios";
import "./InputTextArea.css";
import robo from '../../assets/img/robot.png';
import AnimatedStars from "../../components/AnimatedStars";
import {Box,Flex,Button,Spinner} from "@chakra-ui/react";
import { motion } from "framer-motion"; // Biblioteca para animações avançadas
import {useRef } from "react";


const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"; // 🔹 Substitua pelo seu modelo da Hugging Face
const TOKEN = process.env.REACT_APP_HUGGING_FACE_API_KEY; // 🔹 Substitua pelo seu token da Hugging Face

const LlamaChat = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null); // Referência para o container principal

  const queryLlama = async () => {
    if (!input) return;

    setLoading(true);
    setResponse(null);

    try {
      const { data } = await axios.post(
        API_URL,
        { inputs: input },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(data[0]?.generated_text || "Nenhuma resposta.");
    } catch (error) {
      console.error("Erro na API:", error);
      setResponse("Erro ao buscar resposta.");
    }

    setLoading(false);
  };

  return (
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
    <AnimatedStars />
    <Box w={"90%"} h={"100%"} mt={5}
      overflow={"auto"}
      style={{ "-webkit-overflow-scrolling": "touch", "scrollbar-width": "none", "msOverflowStyle": "none" }}
    >
      <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", overflow: "auto" }}>
        <h1>CHAT por IA  (em teste)</h1>
        <img src={robo} alt="robo" style={{ width: "200px", display: "block", margin: "auto" }} />
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && queryLlama()}
            rows={2}
            className="input-text"
            placeholder="Pergunte algo..." />
          <div className="input-border"></div>
        </div>
        <Button onClick={queryLlama} isDisabled={loading} mt={5}
        color={"#fff"} background={"#42c920"} _hover={{ background: "#256a10" }}           
        >
       {loading ? (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <Spinner size="sm" /> <span>Carregando...</span>
  </div>
) : (
  "Enviar"
)}
        </Button>
        {response && (
          <div style={{ marginTop: "5px" }}>
            <h3>Resposta:</h3>
            <textarea
              value={response}
              rows={20}
              className="input-text2"
              readOnly />
          </div>
        )}
      </div>
    </Box>
    </Flex>
    </Box>
  );
};

export default LlamaChat;
