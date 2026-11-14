import { afterEach, describe, expect, it } from 'vitest';
import { OPEN_JARVIS_EVENT, openJarvisChat } from '../openJarvisChat';

describe('openJarvisChat', () => {
  const handleOpen = (event: Event) => event.preventDefault();

  afterEach(() => {
    window.removeEventListener(OPEN_JARVIS_EVENT, handleOpen);
  });

  it('avisa que ninguém abriu o chat quando o botão do JARVIS não está na página', () => {
    expect(openJarvisChat()).toBe(false);
  });

  it('confirma a abertura quando o botão do JARVIS atende o evento', () => {
    window.addEventListener(OPEN_JARVIS_EVENT, handleOpen);
    expect(openJarvisChat()).toBe(true);
  });
});
