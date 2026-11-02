const MAX_TEXT_CHARS = 1500;
const MAX_ALERTS_PER_SESSION = 30;
const SESSION_WINDOW_MS = 60 * 60 * 1000;
const TELEGRAM_TIMEOUT_MS = 3000;

export interface ChatAlertInput {
  sessionId: string;
  question: string;
  answer?: string;
  failedStatus?: number;
  location?: string;
  isNewConversation: boolean;
}

interface SessionUsage {
  count: number;
  windowStart: number;
}

// Contador em memória da instância da function: protege contra rajadas, mas zera em cold start.
const sessions = new Map<string, SessionUsage>();

export function registerAlert(sessionId: string, now = Date.now()): { allowed: boolean; isNew: boolean } {
  const usage = sessions.get(sessionId);
  if (!usage || now - usage.windowStart > SESSION_WINDOW_MS) {
    sessions.set(sessionId, { count: 1, windowStart: now });
    return { allowed: true, isNew: !usage };
  }
  usage.count++;
  return { allowed: usage.count <= MAX_ALERTS_PER_SESSION, isNew: false };
}

export function resetAlertSessions() {
  sessions.clear();
}

function truncate(text: string): string {
  const clean = text.trim();
  return clean.length > MAX_TEXT_CHARS ? `${clean.slice(0, MAX_TEXT_CHARS)}…` : clean;
}

export function buildChatAlert(input: ChatAlertInput): string {
  const header = input.failedStatus
    ? `⚠️ JARVIS falhou (n8n respondeu ${input.failedStatus})`
    : input.isNewConversation
      ? '🤖 JARVIS: nova conversa'
      : '🤖 JARVIS';
  return [
    header,
    input.location ? `🌍 ${input.location}` : null,
    `🆔 ${input.sessionId.slice(0, 8)}`,
    '',
    `👤 Visitante: ${truncate(input.question)}`,
    input.answer ? `\n💬 JARVIS: ${truncate(input.answer)}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

export function locationFromNetlifyGeo(header: string | undefined): string | undefined {
  if (!header) return undefined;
  try {
    const geo = JSON.parse(Buffer.from(header, 'base64').toString('utf8')) as {
      city?: string;
      subdivision?: { code?: string };
      country?: { code?: string };
    };
    const parts = [geo.city, geo.subdivision?.code].filter(Boolean).join(', ');
    return [parts, geo.country?.code].filter(Boolean).join(' — ') || undefined;
  } catch {
    return undefined;
  }
}

export async function sendTelegramText(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    if (!res.ok) console.error('[chatAlert] Telegram respondeu', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('[chatAlert] Falha ao enviar para o Telegram:', err);
    return false;
  }
}
