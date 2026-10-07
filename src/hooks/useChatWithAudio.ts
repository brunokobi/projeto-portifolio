import { useCallback } from 'react';
import { speak, stopSpeech } from '../utils/textToSpeech';

interface UseChatWithAudioProps {
  selectedLanguage: string; // pt-BR, en-US, etc
  audioEnabled: boolean;
}

export function useChatWithAudio({ selectedLanguage, audioEnabled }: UseChatWithAudioProps) {
  const respondWithAudio = useCallback(
    (responseText: string) => {
      if (!audioEnabled) return;

      try {
        speak({
          text: responseText,
          language: selectedLanguage,
          rate: 1,
          pitch: 1,
          volume: 1,
        });
      } catch (error) {
        console.error('Erro ao gerar áudio:', error);
      }
    },
    [selectedLanguage, audioEnabled]
  );

  const stopAudio = useCallback(() => {
    stopSpeech();
  }, []);

  return {
    respondWithAudio,
    stopAudio,
  };
}
