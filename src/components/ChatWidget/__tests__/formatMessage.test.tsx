import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { formatMessage } from '../formatMessage';

const renderText = (text: string) => render(<ChakraProvider>{formatMessage(text)}</ChakraProvider>);

describe('formatMessage', () => {
  it('mostra negrito sem os asteriscos', () => {
    const { container } = renderText('O Bruno é **desenvolvedor full stack**.');
    expect(screen.getByText('desenvolvedor full stack').tagName).toBe('STRONG');
    expect(container.textContent).not.toContain('**');
  });

  it('transforma linhas com hífen em lista', () => {
    const { container } = renderText('Tecnologias:\n- React\n- TypeScript\n- Python');
    const items = container.querySelectorAll('ul li');
    expect(items).toHaveLength(3);
    expect(items[1].textContent).toBe('TypeScript');
  });

  it('transforma linhas numeradas em lista ordenada', () => {
    const { container } = renderText('1. Primeiro\n2. Segundo');
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
  });

  it('cria link para URL sem engolir a pontuação final', () => {
    renderText('Veja https://github.com/brunokobi.');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/brunokobi');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('não interpreta HTML vindo da resposta', () => {
    const { container } = renderText('<img src=x onerror=alert(1)>');
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img');
  });
});
