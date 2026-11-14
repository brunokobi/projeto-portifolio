export const OPEN_JARVIS_EVENT = 'jarvis:open';

export function openJarvisChat(): boolean {
  const event = new Event(OPEN_JARVIS_EVENT, { cancelable: true });
  return !window.dispatchEvent(event);
}
