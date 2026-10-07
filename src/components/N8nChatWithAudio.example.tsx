// Exemplo de integração: n8n + TTS
// Use isso como base se tiver um wrapper customizado pro n8nchatui

import { useN8nWithAudio } from '../hooks/useN8nWithAudio';

/**
 * Exemplo 1: Se você tiver um componente que encapsula n8nchatui
 */
export function N8nChatWithAudioExample() {
  const { sendMessageToN8n, stopAudio } = useN8nWithAudio({
    n8nWebhookUrl: 'https://seu-n8n.com/webhook/chat', // Substitua pela sua URL
    selectedLanguage: 'pt-BR',
    audioEnabled: true,
  });

  const handleUserMessage = async (userMessage: string) => {
    try {
      // Envia pro n8n E fala resposta automaticamente
      const response = await sendMessageToN8n(userMessage);
      console.log('Resposta:', response);
      // UI já reproduz áudio automaticamente
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      {/* Seu n8nchatui widget aqui */}
      <button onClick={() => stopAudio()}>Parar áudio</button>
    </div>
  );
}

/**
 * Exemplo 2: Se você quer interceptar respostas do n8nchatui via script
 * Adicione isso no index.html ou num useEffect global
 */
export function injectN8nAudioInterceptor(selectedLanguage: string = 'pt-BR') {
  const { speak, stopSpeech } = require('../utils/textToSpeech');

  // Observa mudanças no DOM pra detectar novas mensagens
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Procura por mensagens da IA no DOM
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const text = (node as HTMLElement).textContent;
            // Se encontrar mensagem da IA, fala
            if (text && (node as HTMLElement).classList.contains('ai-message')) {
              speak({
                text,
                language: selectedLanguage,
                rate: 1,
                pitch: 1,
                volume: 1,
              });
            }
          }
        });
      }
    });
  });

  // Observa o container do chat
  const chatContainer = document.querySelector('[data-testid="chat-messages"]') ||
                        document.querySelector('.chat-messages') ||
                        document.querySelector('#chat-widget');

  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true,
    });
  }

  return () => observer.disconnect();
}

/**
 * Exemplo 3: Se n8n retorna respostas via API
 * (Configure isso no seu workflow do n8n)
 */
export async function handleN8nResponseWithAudio(
  response: { message: string; language?: string },
  audioEnabled: boolean = true,
  selectedLanguage: string = 'pt-BR'
) {
  if (!audioEnabled) return;

  const { speak } = require('../utils/textToSpeech');

  speak({
    text: response.message,
    language: response.language || selectedLanguage,
    rate: 1,
    pitch: 1,
    volume: 1,
  });
}
