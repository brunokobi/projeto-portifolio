// Exemplo de como usar TTS no chat widget
// Integre isso no seu componente de chat existente

import { useState } from 'react';
import { useChatWithAudio } from '../hooks/useChatWithAudio';

export function ChatExample() {
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState<{ text: string; role: 'user' | 'assistant' }[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { respondWithAudio, stopAudio } = useChatWithAudio({
    selectedLanguage,
    audioEnabled,
  });

  const handleSendMessage = async (userMessage: string) => {
    // 1. Adiciona mensagem do usuário
    setMessages((prev) => [...prev, { text: userMessage, role: 'user' }]);
    setInputValue('');

    // 2. Gera resposta (aqui você chamaria sua IA/API)
    const response = await generateAIResponse(userMessage, selectedLanguage);

    // 3. Adiciona resposta
    setMessages((prev) => [...prev, { text: response, role: 'assistant' }]);

    // 4. Fala a resposta (se áudio habilitado)
    respondWithAudio(response);
  };

  return (
    <div className="chat-container">
      {/* Seletor de idioma */}
      <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
        <option value="pt-BR">🇧🇷 Português</option>
        <option value="en-US">🇺🇸 English</option>
        <option value="es-ES">🇪🇸 Español</option>
        <option value="fr-FR">🇫🇷 Français</option>
      </select>

      {/* Toggle áudio */}
      <button onClick={() => setAudioEnabled(!audioEnabled)}>
        {audioEnabled ? '🔊 Áudio ON' : '🔇 Áudio OFF'}
      </button>

      {/* Botão stop (quando áudio tá tocando) */}
      {audioEnabled && (
        <button onClick={stopAudio}>⏹ Parar áudio</button>
      )}

      {/* Mensagens */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
        placeholder="Digite sua pergunta..."
      />
      <button onClick={() => handleSendMessage(inputValue)}>Enviar</button>
    </div>
  );
}

// Substitua isso pela sua API real
async function generateAIResponse(message: string, language: string): Promise<string> {
  // Exemplo com OpenAI, Claude, etc
  // Importante: adicione no prompt "Responda em [idioma]"
  return `Resposta em ${language}: ${message}`;
}
