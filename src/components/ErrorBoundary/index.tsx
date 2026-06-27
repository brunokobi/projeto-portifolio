import React, { Component } from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          h="100vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg="black"
          color="white"
          gap={4}
        >
          <Heading color="#42c920" fontSize="2xl">Algo deu errado</Heading>
          <Text color="gray.400" textAlign="center" maxW="400px">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </Text>
          <Button
            onClick={() => this.setState({ hasError: false })}
            bg="#42c920"
            color="black"
            _hover={{ bg: "#256a10" }}
          >
            Tentar novamente
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
