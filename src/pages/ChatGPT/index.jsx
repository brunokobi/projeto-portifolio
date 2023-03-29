import React, { useState } from 'react';
import { Box, Image } from "@chakra-ui/react";
import AnimatedStars from "../../components/AnimatedStars";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import './InputTextArea.css'
import questions from "../../assets/img/questions.png";
import robot from "../../assets/img/robot.png";


function InputComChat() {
  const [texto, setTexto] = useState('');
  const constraintsRef = useRef(null);
  const { Configuration, OpenAIApi } = require("openai"); 

const configuration = new Configuration({  
  apiKey:'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',
  // apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



  const enviarMensagem = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: texto,
          max_tokens: 50,
          temperature: 0.5,
          n: 1,
          stop: '\n'
    });
    console.log(completion.data.choices[0].text);   
  };

  return (
     <AnimatePresence>
     <Box
       as={motion.div}
       ref={constraintsRef}
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
     >
       <Box
         h="100vh"
         overflowY="auto"
         w="100%"
         overflowX="hidden"
         direction="column"
         align="center"
         position="relative"
         gap={5}
         pt={8}
         pb={24}
         scrollBehavior="smooth"
         as={motion.div}
         css={{
           "&::-webkit-scrollbar": {
             width: "5px",
             height: "10px",
           },
           "&::-webkit-scrollbar-track": {
             width: "6px",
           },
           "&::-webkit-scrollbar-thumb": {
             background: "rgb(196, 196, 196)",
             borderRadius: "24px",
           },
         }}
       >
         <Box
           position="relative"
           id="top"
           direction={{ base: "column", md: "row" }}
           px={6}
           justify="space-between"
           alignItems="center"
           w="100%"
           maxW={{ base: "100%", md: "700px" }}
           initial="hidden"
           animate="visible"
         >
           <Box
           position="relative"
           as={motion.div}
           whileHover={{ scale: 1.5 }}
           whileTap={{
             scale: 0.8,
             borderRadius: "100%",
           }}
         >  
          <Image src={questions}  width="40%"/>
          </Box>
          
          <div className="input-container">            
                <textarea
                  className="input-text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Digite aqui sua pergunta para o ChatGPT"
                />
            <div className="input-border"/>     
            </div>
         
          <button className="button" onClick={enviarMensagem}>
          <div className="enviar-text">ENVIAR</div>
            <div className="enviar-border"></div>
          </button>        

         </Box>
         <Box
           position="relative"
           margin={50}

           as={motion.div}
           whileHover={{ scale: 1.5 }}
           whileTap={{
             scale: 0.8,
             borderRadius: "100%",
           }}
         >  
          <Image src={robot}  width="10%" />        
         </Box>
         <AnimatedStars />
       </Box>
     </Box>
   </AnimatePresence>
  );
}

export default InputComChat;
