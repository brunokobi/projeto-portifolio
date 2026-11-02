import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HandlerEvent, HandlerContext } from '@netlify/functions';
import { buildChatAlert, locationFromNetlifyGeo, registerAlert, resetAlertSessions } from '../lib/chatAlert';
import { handler } from '../functions/n8n-chat';

const geoHeader = Buffer.from(
  JSON.stringify({ city: 'Serra', subdivision: { code: 'ES' }, country: { code: 'BR' } })
).toString('base64');

const makeEvent = (body: object): HandlerEvent =>
  ({
    httpMethod: 'POST',
    headers: { 'x-nf-geo': geoHeader },
    body: JSON.stringify(body),
  }) as unknown as HandlerEvent;

const callHandler = (body: object) =>
  handler(makeEvent(body), {} as HandlerContext, () => {}) as Promise<{ statusCode: number; body: string }>;

describe('buildChatAlert', () => {
  it('monta a mensagem com pergunta, resposta, local e sessão curta', () => {
    const text = buildChatAlert({
      sessionId: '1234567890abcdef',
      question: 'Quem é o Bruno?',
      answer: 'O Bruno é **dev**.',
      location: 'Serra, ES — BR',
      isNewConversation: true,
    });
    expect(text).toContain('nova conversa');
    expect(text).toContain('🌍 Serra, ES — BR');
    expect(text).toContain('🆔 12345678');
    expect(text).toContain('👤 Visitante: Quem é o Bruno?');
    expect(text).toContain('💬 JARVIS: O Bruno é **dev**.');
  });

  it('corta textos muito longos', () => {
    const text = buildChatAlert({ sessionId: 's', question: 'a'.repeat(5000), isNewConversation: false });
    expect(text.length).toBeLessThan(1700);
    expect(text).toContain('…');
  });

  it('avisa quando o n8n falha', () => {
    expect(buildChatAlert({ sessionId: 's', question: 'oi', failedStatus: 500, isNewConversation: false })).toContain(
      'n8n respondeu 500'
    );
  });
});

describe('registerAlert', () => {
  beforeEach(() => resetAlertSessions());

  it('marca a primeira mensagem como nova conversa', () => {
    expect(registerAlert('a', 0)).toEqual({ allowed: true, isNew: true });
    expect(registerAlert('a', 1)).toEqual({ allowed: true, isNew: false });
  });

  it('bloqueia depois de 30 avisos na mesma hora e libera na hora seguinte', () => {
    for (let i = 0; i < 30; i++) registerAlert('b', i);
    expect(registerAlert('b', 31).allowed).toBe(false);
    expect(registerAlert('b', 60 * 60 * 1000 + 100).allowed).toBe(true);
  });
});

describe('locationFromNetlifyGeo', () => {
  it('lê cidade, estado e país do header da Netlify', () => {
    expect(locationFromNetlifyGeo(geoHeader)).toBe('Serra, ES — BR');
  });

  it('ignora header ausente ou inválido', () => {
    expect(locationFromNetlifyGeo(undefined)).toBeUndefined();
    expect(locationFromNetlifyGeo('não é base64 json')).toBeUndefined();
  });
});

describe('n8n-chat com aviso no Telegram', () => {
  beforeEach(() => {
    resetAlertSessions();
    process.env.N8N_WEBHOOK_URL = 'https://n8n.test/webhook/chat';
    process.env.TELEGRAM_BOT_TOKEN = 'TOKEN';
    process.env.TELEGRAM_CHAT_ID = '42';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  it('envia pergunta e resposta ao Telegram em texto puro e devolve a resposta do n8n intacta', async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        url.includes('api.telegram.org')
          ? new Response('{"ok":true}', { status: 200 })
          : new Response('{"output":"Oi, eu sou o JARVIS"}', { status: 200 })
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await callHandler({ chatInput: 'Quem é o *Bruno_?', sessionId: 'abcdef123456' });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ output: 'Oi, eu sou o JARVIS' });
    const telegramCall = fetchMock.mock.calls.find(([u]) => u.includes('api.telegram.org')) as unknown as [
      string,
      { body: string },
    ];
    expect(telegramCall[0]).toBe('https://api.telegram.org/botTOKEN/sendMessage');
    const sent = JSON.parse(telegramCall[1].body);
    expect(sent.chat_id).toBe('42');
    expect(sent.parse_mode).toBeUndefined();
    expect(sent.text).toContain('Quem é o *Bruno_?');
    expect(sent.text).toContain('Oi, eu sou o JARVIS');
    expect(sent.text).toContain('Serra, ES — BR');
  });

  it('não derruba o chat se o Telegram falhar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.includes('api.telegram.org')
          ? Promise.reject(new Error('telegram fora do ar'))
          : Promise.resolve(new Response('{"output":"Resposta"}', { status: 200 }))
      )
    );

    const res = await callHandler({ chatInput: 'oi', sessionId: 's1' });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).output).toBe('Resposta');
  });

  it('não chama o Telegram quando o bot não está configurado', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const fetchMock = vi.fn(() => Promise.resolve(new Response('{"output":"ok"}', { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);

    await callHandler({ chatInput: 'oi', sessionId: 's2' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
