import { useCallback } from 'react';
import { speak, stopSpeech } from '../utils/textToSpeech';

interface UseN8nWithAudioProps {
  n8nWebhookUrl: string; // URL do webhook do n8n
  selectedLanguage: string; // pt-BR, en-US, etc
  audioEnabled: boolean;
}

export function useN8nWithAudio({ n8nWebhookUrl, selectedLanguage, audioEnabled }: UseN8nWithAudioProps) {
  const sendMessageToN8n = useCallback(
    async (message: string): Promise<string> => {
      try {
        // Envia mensagem pro n8n
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            language: selectedLanguage, // Passa idioma pra n8n se precisar
          }),
        });

        if (!response.ok) {
          throw new Error(`n8n error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.response || data.message || data.text || '';

        // Fala a resposta se áudio habilitado
        if (audioEnabled && aiResponse) {
          speak({
            text: aiResponse,
            language: selectedLanguage,
            rate: 1,
            pitch: 1,
            volume: 1,
          });
        }

        return aiResponse;
      } catch (error) {
        console.error('Erro ao comunicar com n8n:', error);
        throw error;
      }
    },
    [n8nWebhookUrl, selectedLanguage, audioEnabled]
  );

  const stopAudio = useCallback(() => {
    stopSpeech();
  }, []);

  return {
    sendMessageToN8n,
    stopAudio,
  };
}
