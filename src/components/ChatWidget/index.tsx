import { useState, useRef, useEffect } from 'react';
import { Box, Input, Button, VStack, HStack, Text, Select, IconButton } from '@chakra-ui/react';
import { useChatWithAudio } from '../../hooks/useChatWithAudio';
import { speak, stopSpeech } from '../../utils/textToSpeech';
import styles from './ChatWidget.module.css';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const GREEN = '#42c920';

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bom tardi! 👋 Aqui em Serra está mormo e agradável! 27°C com 😎 lindo demais O que posso te ajudar hoje?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { respondWithAudio, stopAudio } = useChatWithAudio({
    selectedLanguage,
    audioEnabled,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulação de resposta da IA
      // Substitua isso por sua API real (OpenAI, Claude, n8n, etc)
      const response = await generateAIResponse(inputValue, selectedLanguage);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Fala a resposta se áudio habilitado
      if (audioEnabled) {
        setIsSpeaking(true);
        respondWithAudio(response);
        setTimeout(() => setIsSpeaking(false), 1000);
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAudio = () => {
    stopAudio();
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <Box
      className={styles.chatWidget}
      bg="rgba(0, 0, 0, 0.9)"
      backdropFilter="blur(10px)"
      borderRadius="12px"
      border={`1px solid rgba(66, 201, 32, 0.2)`}
      boxShadow={`0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(66, 201, 32, 0.1)`}
      w="100%"
      maxW="500px"
      h="600px"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Header */}
      <HStack
        p={4}
        borderBottom={`1px solid rgba(66, 201, 32, 0.2)`}
        justify="space-between"
        bg="rgba(66, 201, 32, 0.05)"
      >
        <HStack spacing={2}>
          <Text fontSize="lg" fontWeight="bold" color={GREEN}>
            💬 Chat IA
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            size="sm"
            w="130px"
            bg="rgba(66, 201, 32, 0.1)"
            borderColor={GREEN}
            color="white"
          >
            <option value="pt-BR">🇧🇷 Português</option>
            <option value="en-US">🇺🇸 English</option>
            <option value="es-ES">🇪🇸 Español</option>
            <option value="fr-FR">🇫🇷 Français</option>
          </Select>
          <IconButton
            aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
            icon={<span>{audioEnabled ? '🔊' : '🔇'}</span>}
            onClick={() => setAudioEnabled(!audioEnabled)}
            size="sm"
            bg="rgba(66, 201, 32, 0.1)"
            borderColor={GREEN}
            _hover={{ bg: `rgba(66, 201, 32, 0.2)` }}
          />
        </HStack>
      </HStack>

      {/* Messages */}
      <VStack
        flex={1}
        overflowY="auto"
        spacing={4}
        p={4}
        align="stretch"
        className={styles.messagesContainer}
      >
        {messages.map((msg) => (
          <HStack
            key={msg.id}
            justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            w="100%"
          >
            <Box
              maxW="80%"
              bg={msg.role === 'user' ? `rgba(66, 201, 32, 0.2)` : `rgba(100, 100, 100, 0.2)`}
              borderRadius="8px"
              p={3}
              borderLeft={`3px solid ${msg.role === 'user' ? GREEN : 'rgba(66, 201, 32, 0.5)'}`}
            >
              <Text fontSize="sm" color="white" lineHeight="1.5">
                {msg.text}
              </Text>
              <Text fontSize="xs" color="rgba(255, 255, 255, 0.5)" mt={1}>
                {msg.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Box>
          </HStack>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Status Áudio */}
      {isSpeaking && (
        <Box p={2} bg="rgba(66, 201, 32, 0.1)" textAlign="center" fontSize="xs" color={GREEN}>
          🔊 Reproduzindo áudio...
        </Box>
      )}

      {/* Input */}
      <HStack
        p={4}
        borderTop={`1px solid rgba(66, 201, 32, 0.2)`}
        gap={2}
        bg="rgba(66, 201, 32, 0.02)"
      >
        <Input
          placeholder="Digite sua pergunta..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          bg="rgba(66, 201, 32, 0.05)"
          borderColor={GREEN}
          color="white"
          _placeholder={{ color: 'rgba(255, 255, 255, 0.4)' }}
          _focus={{ borderColor: GREEN, boxShadow: `0 0 8px rgba(66, 201, 32, 0.3)` }}
        />
        <Button
          onClick={isSpeaking ? handleStopAudio : handleSendMessage}
          isLoading={isLoading}
          bg={isSpeaking ? 'rgb(200, 50, 50)' : GREEN}
          color="black"
          fontWeight="bold"
          _hover={{ opacity: 0.8 }}
          minW="60px"
        >
          {isSpeaking ? '⏹' : '➤'}
        </Button>
      </HStack>
    </Box>
  );
}

// Substitua isso por sua API real
async function generateAIResponse(message: string, language: string): Promise<string> {
  // Exemplo simples - integre com OpenAI, Claude, n8n, etc
  // Importante: adicione no prompt que deve responder em [language]

  const responses: Record<string, string[]> = {
    'pt-BR': [
      'Que pergunta interessante! Deixa eu pensar sobre isso...',
      'Ótima questão! Posso te ajudar com isso.',
      'Entendi sua pergunta. Aqui está minha resposta...',
    ],
    'en-US': [
      'That\'s an interesting question! Let me think about it...',
      'Great question! I can help you with that.',
      'I understand your question. Here\'s my answer...',
    ],
    'es-ES': [
      '¡Esa es una pregunta interesante! Déjame pensar...',
      '¡Gran pregunta! Puedo ayudarte con eso.',
      'Entiendo tu pregunta. Aquí está mi respuesta...',
    ],
    'fr-FR': [
      'C\'est une question intéressante! Laissez-moi réfléchir...',
      'Excellente question! Je peux vous aider avec ça.',
      'Je comprends votre question. Voici ma réponse...',
    ],
  };

  const langResponses = responses[language] || responses['pt-BR'];
  return langResponses[Math.floor(Math.random() * langResponses.length)];
}
