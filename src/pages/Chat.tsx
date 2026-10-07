import { Box, Container, VStack } from '@chakra-ui/react';
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
      <Container maxW="600px">
        <VStack spacing={8} align="center">
          <ChatWidget />
        </VStack>
      </Container>
    </Box>
  );
}
