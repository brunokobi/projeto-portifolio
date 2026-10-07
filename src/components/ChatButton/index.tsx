import { IconButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const GREEN = '#42c920';

export function ChatButton() {
  const navigate = useNavigate();

  return (
    <IconButton
      aria-label="Abrir chat"
      icon={<span style={{ fontSize: '24px' }}>💬</span>}
      onClick={() => navigate('/chat')}
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={100}
      bg={`rgba(66, 201, 32, 0.1)`}
      borderColor={GREEN}
      border="2px solid"
      borderRadius="50%"
      w="60px"
      h="60px"
      _hover={{
        bg: `rgba(66, 201, 32, 0.2)`,
        boxShadow: `0 0 20px rgba(66, 201, 32, 0.5)`,
        transform: 'scale(1.1)',
      }}
      _active={{
        transform: 'scale(0.95)',
      }}
      transition="all 0.3s ease"
      title="Abrir chat com IA"
    />
  );
}
