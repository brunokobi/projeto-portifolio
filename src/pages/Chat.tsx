import { Box, Container } from '@chakra-ui/react';
import { ChatWidget } from '../components/ChatWidget';

export default function ChatPage() {
  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 40, 0.8) 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Container maxW="600px" h="min(720px, calc(100vh - 140px))" display="flex">
        <ChatWidget />
      </Container>
    </Box>
  );
}
