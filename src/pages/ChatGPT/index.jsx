// teste de ia usando modelo de mistral
import { useState } from "react";
import axios from "axios";
import "./InputTextArea.css";
import robo from '../../assets/img/robot.png';
import AnimatedStars from "../../components/AnimatedStars";
import {Box} from "@chakra-ui/react";

const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"; // 🔹 Substitua pelo seu modelo da Hugging Face
const TOKEN = process.env.REACT_APP_HUGGING_FACE_API_KEY; // 🔹 Substitua pelo seu token da Hugging Face

const LlamaChat = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <>
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
        <button onClick={queryLlama} disabled={loading} className="button">
          {loading ? "Carregando..." : "Enviar"}
        </button>
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
    </>
  );
};

export default LlamaChat;
