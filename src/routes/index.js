import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Nav from "../components/Nav";
import InputComChat from "../pages/ChatGPT/index";
import QnA from "../pages/TensorFlow//index";

const Router = () => {
  return (
    <Box minH="100vh" bg="black" color="rgb(196, 196, 196)">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/chat" element={<InputComChat />} />
        <Route path="/tensorflow" element={<QnA />} />         
      </Routes>
      <Nav />
    </Box>
  );
};

export default Router;
