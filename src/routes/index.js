import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Nav from "../components/Nav";

const Router = () => {
  return (
    <Box minH="100vh" bg="black" color="rgb(196, 196, 196)">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />       
      </Routes>
      <Nav />
    </Box>
  );
};

export default Router;
