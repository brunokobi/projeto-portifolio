import { useCallback, useRef } from 'react';
import { speak, stopSpeech, isSpeaking } from '../utils/textToSpeech';

interface UseChatWithAudioProps {
  selectedLanguage: string; // pt-BR, en-US, etc
  audioEnabled: boolean;
}

export function useChatWithAudio({ selectedLanguage, audioEnabled }: UseChatWithAudioProps) {
  const isPlayingRef = useRef(false);

  const respondWithAudio = useCallback(
    (responseText: string) => {
      if (!audioEnabled) return;

      try {
        // Fala em áudio
        speak({
          text: responseText,
          language: selectedLanguage,
          rate: 1,
          pitch: 1,
          volume: 1,
        });

        isPlayingRef.current = true;
      } catch (error) {
        console.error('Erro ao gerar áudio:', error);
      }
    },
    [selectedLanguage, audioEnabled]
  );

  const stopAudio = useCallback(() => {
    stopSpeech();
    isPlayingRef.current = false;
  }, []);

  return {
    respondWithAudio,
    stopAudio,
    isPlaying: isPlayingRef.current,
  };
}
