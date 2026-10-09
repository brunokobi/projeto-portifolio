import { useCallback } from 'react';
import { speak, stopSpeech } from '../utils/textToSpeech';

interface UseChatWithAudioProps {
  selectedLanguage: string;
  audioEnabled: boolean;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export function useChatWithAudio({ selectedLanguage, audioEnabled, onSpeakingChange }: UseChatWithAudioProps) {
  const respondWithAudio = useCallback(
    (responseText: string) => {
      if (!audioEnabled) return;

      try {
        onSpeakingChange?.(true);
        speak({
          text: responseText,
          language: selectedLanguage,
          rate: 1,
          pitch: 1,
          volume: 1,
          onEnd: () => onSpeakingChange?.(false),
        });
      } catch (error) {
        console.error('Erro ao gerar áudio:', error);
        onSpeakingChange?.(false);
      }
    },
    [selectedLanguage, audioEnabled, onSpeakingChange]
  );

  const stopAudio = useCallback(() => {
    stopSpeech();
  }, []);

  return {
    respondWithAudio,
    stopAudio,
  };
}
