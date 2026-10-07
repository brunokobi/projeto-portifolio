import { useState } from 'react';
import { IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from '@chakra-ui/react';
import { ChatWidget } from '../ChatWidget';

const GREEN = '#42c920';

export function ChatButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* Botão Flutuante */}
      <IconButton
        aria-label="Abrir chat"
        icon={<img src="https://brunokobi.netlify.app/int-icon.png" style={{ width: '24px', height: '24px' }} />}
        onClick={onOpen}
        position="fixed"
        bottom="80px"
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

      {/* Modal do Chat */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent
          bg="rgba(0, 0, 0, 0.95)"
          borderLeft={`1px solid rgba(66, 201, 32, 0.2)`}
          backdropFilter="blur(10px)"
        >
          <DrawerCloseButton color={GREEN} />
          <DrawerHeader />
          <DrawerBody p={0}>
            <ChatWidget />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
