import { afterEach, describe, expect, it, vi } from 'vitest';
import { WHISPER_PROMPT, WHISPER_URL, cleanTranscript, transcribe } from '../useWhisperRecorder';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cleanTranscript', () => {
  it('remove marcas de trecho sem fala', () => {
    expect(cleanTranscript(' [BLANK_AUDIO] Quem é o Bruno? (música) ')).toBe('Quem é o Bruno?');
  });
});

describe('transcribe', () => {
  it('envia o áudio com idioma e vocabulário e devolve o texto limpo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ text: ' O Bruno Kobi trabalha na Vennx?\n' }), {
        status: 200,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const text = await transcribe(new Blob(['x'], { type: 'audio/webm' }), 'pt');

    expect(text).toBe('O Bruno Kobi trabalha na Vennx?');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(WHISPER_URL);
    const form = init.body as FormData;
    expect(form.get('language')).toBe('pt');
    expect(form.get('prompt')).toBe(WHISPER_PROMPT);
    expect((form.get('file') as File).name).toBe('audio.webm');
  });

  it('falha quando o Whisper responde erro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('erro', { status: 502 })));
    await expect(transcribe(new Blob(['x']), 'pt')).rejects.toThrow('502');
  });
});
