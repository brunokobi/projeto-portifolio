import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Box, Input, IconButton, VStack, HStack, Text, Wrap, WrapItem, Button } from '@chakra-ui/react';
import { useChatWithAudio } from '../../hooks/useChatWithAudio';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useWhisperRecorder } from '../../hooks/useWhisperRecorder';
import { stopSpeech } from '../../utils/textToSpeech';
import { generateGreeting } from '../../utils/generateGreeting';
import { JarvisCore, type JarvisState } from './JarvisCore';
import { formatMessage } from './formatMessage';
import { SUGGESTIONS } from './suggestions';
import styles from './ChatWidget.module.css';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const GREEN = '#42c920';
const LANGUAGE = 'pt-BR';
const FALLBACK_GREETING = 'Olá. Eu sou o JARVIS, seu assistente virtual. Como posso ajudá-lo?';

const STATUS_LABEL: Record<JarvisState, string> = {
  idle: 'Online',
  thinking: 'Pensando...',
  speaking: 'Falando...',
  listening: 'Ouvindo...',
};

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="17" x2="12" y2="22" />
  </svg>
);

let messageSeq = 0;
const newId = () => `${Date.now()}-${messageSeq++}`;

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', text: FALLBACK_GREETING, role: 'assistant', timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Conversa por voz: se a pergunta veio do microfone, o JARVIS volta a ouvir quando termina de falar.
  const voiceConversationRef = useRef(false);
  const wasSpeakingRef = useRef(false);

  const { respondWithAudio, stopAudio } = useChatWithAudio({
    selectedLanguage: LANGUAGE,
    audioEnabled: true,
    onSpeakingChange: setIsSpeaking,
  });

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isLoading) return;

      stopSpeech();
      setInputValue('');
      setMessages((prev) => [...prev, { id: newId(), text, role: 'user', timestamp: new Date() }]);
      setIsLoading(true);

      try {
        const response = await generateAIResponse(text);
        setMessages((prev) => [...prev, { id: newId(), text: response, role: 'assistant', timestamp: new Date() }]);
        respondWithAudio(response);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, respondWithAudio]
  );

  const handleVoiceText = useCallback(
    (text: string) => {
      voiceConversationRef.current = true;
      void sendMessage(text);
    },
    [sendMessage]
  );
  // Whisper (VPS) quando o navegador consegue gravar; senão, o reconhecimento do navegador.
  const whisper = useWhisperRecorder({ language: LANGUAGE.split('-')[0], onFinal: handleVoiceText });
  const browserSpeech = useSpeechRecognition({
    lang: LANGUAGE,
    onInterim: setInputValue,
    onFinal: handleVoiceText,
  });
  const speech = whisper.supported ? whisper : { ...browserSpeech, isTranscribing: false };

  const { start: startWhisper, isListening: whisperListening, supported: whisperSupported } = whisper;
  useEffect(() => {
    const finishedSpeaking = wasSpeakingRef.current && !isSpeaking;
    wasSpeakingRef.current = isSpeaking;
    if (!finishedSpeaking || !voiceConversationRef.current || !whisperSupported) return;
    if (isLoading || whisperListening) return;
    void startWhisper({ followUp: true });
  }, [isSpeaking, isLoading, whisperListening, whisperSupported, startWhisper]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    generateGreeting().then((greeting) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === 'greeting' ? { ...m, text: greeting, timestamp: new Date() } : m))
      );
      respondWithAudio(greeting);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStopAudio = () => {
    voiceConversationRef.current = false;
    stopAudio();
    stopSpeech();
    setIsSpeaking(false);
  };

  const toggleMic = () => {
    if (speech.isListening) {
      speech.stop();
      return;
    }
    handleStopAudio();
    void speech.start();
  };

  const coreState: JarvisState = speech.isListening
    ? 'listening'
    : isLoading || speech.isTranscribing
      ? 'thinking'
      : isSpeaking
        ? 'speaking'
        : 'idle';
  const hasUserMessage = messages.some((m) => m.role === 'user');

  return (
    <Box
      className={styles.chatWidget}
      bg="rgba(0, 0, 0, 0.9)"
      borderRadius="12px"
      border="1px solid rgba(66, 201, 32, 0.2)"
      w="100%"
      h="100%"
      minH={0}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <HStack px={4} py={3} spacing={3} borderBottom="1px solid rgba(66, 201, 32, 0.2)" bg="rgba(66, 201, 32, 0.05)">
        <JarvisCore state={coreState} size={56} />
        <Box minW={0}>
          <Text fontSize="lg" fontWeight="bold" color={GREEN} lineHeight={1.2} letterSpacing="0.08em">
            JARVIS
          </Text>
          <HStack spacing={1.5} fontSize="xs" color="whiteAlpha.700" role="status" aria-live="polite">
            <Box w="6px" h="6px" borderRadius="full" bg={GREEN} className={coreState === 'idle' ? undefined : styles.blink} />
            <Text>{speech.isTranscribing ? 'Transcrevendo...' : STATUS_LABEL[coreState]}</Text>
          </HStack>
        </Box>
      </HStack>

      <VStack flex={1} minH={0} overflowY="auto" spacing={4} p={4} align="stretch" className={styles.messagesContainer} aria-live="polite">
        {messages.map((msg) => (
          <HStack key={msg.id} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'} w="100%" align="flex-end" spacing={2}>
            {msg.role === 'assistant' && (
              <img
                src="https://jetsoftpro.com/wp-content/themes/JSP/img/jetty-and-starships/Jetty-hover.gif"
                alt="JARVIS"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            )}
            <Box
              maxW="80%"
              minW={0}
              bg={msg.role === 'user' ? 'rgba(66, 201, 32, 0.2)' : 'rgba(100, 100, 100, 0.2)'}
              borderRadius="8px"
              p={3}
              borderLeft={`3px solid ${msg.role === 'user' ? GREEN : 'rgba(66, 201, 32, 0.5)'}`}
            >
              <Box fontSize="sm" color="whiteAlpha.900" lineHeight="1.5" overflowWrap="anywhere">
                {msg.role === 'assistant' ? formatMessage(msg.text) : <Text>{msg.text}</Text>}
              </Box>
              <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Box>
            {msg.role === 'user' && (
              <img
                src="https://cdn-icons-png.flaticon.com/512/9672/9672521.png"
                alt="Você"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            )}
          </HStack>
        ))}

        {!hasUserMessage && !isLoading && (
          <Wrap spacing={2} pl="40px">
            {SUGGESTIONS.map((s) => (
              <WrapItem key={s}>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="rgba(66, 201, 32, 0.5)"
                  color={GREEN}
                  fontWeight="normal"
                  borderRadius="full"
                  _hover={{ bg: 'rgba(66, 201, 32, 0.12)' }}
                  onClick={() => {
                    voiceConversationRef.current = false;
                    void sendMessage(s);
                  }}
                >
                  {s}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        )}

        {isLoading && (
          <HStack spacing={2} align="flex-end" aria-label="JARVIS está digitando">
            <Box w="32px" />
            <HStack spacing={1} bg="rgba(100, 100, 100, 0.2)" borderRadius="8px" px={4} py={3} borderLeft="3px solid rgba(66, 201, 32, 0.5)">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </HStack>
          </HStack>
        )}
        <div ref={messagesEndRef} />
      </VStack>

      {speech.error && (
        <Text px={4} pb={1} fontSize="xs" color="orange.300" role="alert">
          {speech.error}
        </Text>
      )}

      <HStack as="form" p={3} borderTop="1px solid rgba(66, 201, 32, 0.2)" spacing={2} bg="rgba(66, 201, 32, 0.02)"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          voiceConversationRef.current = false;
          void sendMessage(inputValue);
        }}
      >
        {speech.supported && (
          <IconButton
            type="button"
            aria-label={speech.isListening ? 'Parar de ouvir' : 'Perguntar por voz'}
            title={speech.isListening ? 'Parar de ouvir' : 'Perguntar por voz'}
            icon={<MicIcon />}
            onClick={toggleMic}
            isDisabled={isLoading || speech.isTranscribing}
            variant="outline"
            borderColor={GREEN}
            color={speech.isListening ? 'black' : GREEN}
            bg={speech.isListening ? GREEN : 'transparent'}
            className={speech.isListening ? styles.listening : undefined}
            _hover={{ bg: speech.isListening ? GREEN : 'rgba(66, 201, 32, 0.12)' }}
          />
        )}
        <Input
          id="jarvis-input"
          aria-label="Mensagem para o JARVIS"
          placeholder={
            speech.isListening ? 'Ouvindo...' : speech.isTranscribing ? 'Transcrevendo...' : 'Digite sua pergunta...'
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          isDisabled={isLoading}
          bg="rgba(66, 201, 32, 0.05)"
          borderColor={GREEN}
          color="white"
          _placeholder={{ color: 'whiteAlpha.400' }}
          _focus={{ borderColor: GREEN, boxShadow: '0 0 8px rgba(66, 201, 32, 0.3)' }}
        />
        {isSpeaking ? (
          <IconButton type="button" aria-label="Parar a fala" title="Parar a fala" icon={<span>⏹</span>} onClick={handleStopAudio} bg="rgb(200, 50, 50)" color="white" _hover={{ opacity: 0.85 }} />
        ) : (
          <IconButton type="submit" aria-label="Enviar" title="Enviar" icon={<span>➤</span>} isLoading={isLoading} isDisabled={!inputValue.trim()} bg={GREEN} color="black" _hover={{ opacity: 0.85 }} />
        )}
      </HStack>
    </Box>
  );
}

// chatSessionId: o nó "When chat message received" (Chat Trigger) do n8n só
// reconhece os campos chatInput/sessionId — qualquer outro nome de campo
// (ex.: message/language, formato anterior) faz o workflow rejeitar a
// requisição com 500 "Error in workflow". O sessionId também é o que dá à
// Memória de Conversa (Window Buffer) do workflow contexto entre mensagens
// da mesma visita; sem ele, cada mensagem seria tratada como conversa nova.
const chatSessionId =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function generateAIResponse(message: string): Promise<string> {
  try {
    const response = await fetch('/.netlify/functions/n8n-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId: chatSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n error: ${response.statusText}`);
    }

    const data = await response.json();
    // n8n (Chat Trigger) devolve a resposta no campo "output"
    let output = data.output || 'Desculpe, não consegui processar sua mensagem.';

    // Remove URL do site oficial das respostas
    output = output.replace(/https?:\/\/brunokobi\.netlify\.app\/?/gi, '');

    // Remove frase repetitiva do final
    output = output.replace(/\s*Vamos construir o futuro juntos!\s*$/gi, '');

    output = output.trim();

    return output;
  } catch (error) {
    console.error('Erro ao comunicar com n8n:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
  }
}
