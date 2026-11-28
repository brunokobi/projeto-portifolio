import { IconButton, Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatWidget } from '../ChatWidget';
import { OPEN_JARVIS_EVENT } from './openJarvisChat';

const GREEN = '#42c920';

export function ChatButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { pathname } = useLocation();
  const onChatPage = pathname === '/chat';

  useEffect(() => {
    const handleOpen = (event: Event) => {
      event.preventDefault();
      onOpen();
    };
    window.addEventListener(OPEN_JARVIS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_JARVIS_EVENT, handleOpen);
  }, [onOpen]);

  return (
    <>
      {/* Botão Flutuante */}
      <IconButton
        aria-label="Abrir chat"
        icon={<img src="/int-icon.png" alt="" style={{ width: '24px', height: '24px' }} />}
        onClick={onOpen}
        display={onChatPage ? 'none' : 'inline-flex'}
        position="fixed"
        bottom={{ base: 'calc(60px + env(safe-area-inset-bottom))', md: '80px' }}
        right={{ base: '12px', md: '20px' }}
        zIndex={100}
        bg={`rgba(66, 201, 32, 0.1)`}
        borderColor={GREEN}
        border="2px solid"
        borderRadius="50%"
        w={{ base: '48px', md: '60px' }}
        h={{ base: '48px', md: '60px' }}
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

      {/* Modal do Chat */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay zIndex={1000001} />
        <DrawerContent
          containerProps={{ zIndex: 1000002 }}
          bg="rgba(0, 0, 0, 0.95)"
          borderLeft={`1px solid rgba(66, 201, 32, 0.2)`}
          backdropFilter="blur(10px)"
        >
          <DrawerCloseButton color={GREEN} top={4} right={4} zIndex={1} />
          <DrawerBody p={2} display="flex" overflow="hidden">
            <ChatWidget />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
