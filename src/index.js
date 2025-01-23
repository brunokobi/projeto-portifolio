// Importa o React, necessário para criar componentes
import React from "react";
// Importa o ReactDOM para manipulação do DOM
import ReactDOM from "react-dom/client";
// Importa o componente principal da aplicação
import App from "./App";

// Importa o ChakraProvider, utilizado para estilizar o app com o Chakra UI
import { ChakraProvider } from "@chakra-ui/react";
// Importa o Router, que permite a navegação entre páginas utilizando React Router
import { BrowserRouter as Router } from "react-router-dom";
// Importa o tema customizado definido no projeto
import { theme } from "./styles";

// Cria a raiz do React no elemento HTML com o ID "root"
const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderiza a aplicação dentro do elemento root
root.render(
  <React.StrictMode> 
    {/* Envolve a aplicação no Router para habilitar a navegação entre rotas */}
    <Router>
      {/* Envolve a aplicação no ChakraProvider para aplicar o tema e estilização do Chakra UI */}
      <ChakraProvider theme={theme}>
        {/* Renderiza o componente principal da aplicação */}
        <App />
      </ChakraProvider>
    </Router>
  </React.StrictMode>
);
