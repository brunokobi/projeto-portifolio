import { useCallback, useRef } from 'react';
import { speak, stopSpeech } from '../utils/textToSpeech';

interface UseChatWithAudioProps {
  selectedLanguage: string;
  audioEnabled: boolean;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export function useChatWithAudio({ selectedLanguage, audioEnabled, onSpeakingChange }: UseChatWithAudioProps) {
  const speechIdRef = useRef(0);

  const respondWithAudio = useCallback(
    (responseText: string) => {
      if (!audioEnabled) return;

      const id = ++speechIdRef.current;
      const finish = () => {
        if (speechIdRef.current === id) onSpeakingChange?.(false);
      };

      onSpeakingChange?.(true);
      speak({
        text: responseText,
        language: selectedLanguage,
        rate: 1.4,
        pitch: 1,
        volume: 1,
        onEnd: finish,
      }).catch((error) => {
        console.error('Erro ao gerar áudio:', error);
        finish();
      });
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
