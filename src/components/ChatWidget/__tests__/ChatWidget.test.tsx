import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ChatWidget } from '../index';
import { SUGGESTIONS } from '../suggestions';

vi.mock('../../../utils/generateGreeting', () => ({
  generateGreeting: vi.fn(() => Promise.resolve('Boa tarde! Eu sou o JARVIS.')),
}));
vi.mock('../../../utils/textToSpeech', () => ({
  speak: vi.fn(() => Promise.resolve()),
  stopSpeech: vi.fn(),
}));

const renderWidget = () =>
  render(
    <ChakraProvider>
      <ChatWidget />
    </ChakraProvider>
  );

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 0));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
});

describe('ChatWidget', () => {
  it('mostra a saudação e as sugestões de pergunta', async () => {
    vi.stubGlobal('fetch', vi.fn());
    renderWidget();
    await waitFor(() => expect(screen.getByText('Boa tarde! Eu sou o JARVIS.')).toBeInTheDocument());
    for (const s of SUGGESTIONS) expect(screen.getByRole('button', { name: s })).toBeInTheDocument();
  });

  it('envia a sugestão, mostra o indicador de digitando e formata a resposta', async () => {
    let resolveFetch: (v: unknown) => void = () => {};
    vi.stubGlobal('fetch', vi.fn(() => new Promise((r) => (resolveFetch = r))));
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: SUGGESTIONS[0] }));

    expect(screen.getByText(SUGGESTIONS[0])).toBeInTheDocument();
    expect(screen.getByLabelText('JARVIS está digitando')).toBeInTheDocument();
    expect(screen.getByText('Pensando...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: SUGGESTIONS[1] })).toBeNull();

    resolveFetch({ ok: true, json: () => Promise.resolve({ output: 'O Bruno é **dev full stack**.' }) });

    await waitFor(() => expect(screen.getByText('dev full stack').tagName).toBe('STRONG'));
    expect(screen.queryByLabelText('JARVIS está digitando')).toBeNull();
  });

  it('esconde o microfone quando o navegador não tem reconhecimento de voz', () => {
    vi.stubGlobal('fetch', vi.fn());
    renderWidget();
    expect(screen.queryByRole('button', { name: 'Perguntar por voz' })).toBeNull();
  });

  it('envia a pergunta falada quando o reconhecimento termina', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ output: 'Oi!' }) }));
    vi.stubGlobal('fetch', fetchMock);
    let instance: { onresult: (e: unknown) => void; onend: () => void } | null = null;
    class FakeRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      onresult: ((e: unknown) => void) | null = null;
      onerror = null;
      onend: (() => void) | null = null;
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
      constructor() {
        instance = this as never;
      }
    }
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition;
    renderWidget();

    fireEvent.click(screen.getByRole('button', { name: 'Perguntar por voz' }));
    expect(screen.getByText('Ouvindo...')).toBeInTheDocument();

    instance!.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'quem é o Bruno' } }] });
    instance!.onend();

    await waitFor(() => expect(screen.getByText('Oi!')).toBeInTheDocument());
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1].body);
    expect(body.chatInput).toBe('quem é o Bruno');
  });
});
