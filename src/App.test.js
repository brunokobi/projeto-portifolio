// Importa as funções necessárias para renderizar e interagir com o componente durante o teste
import { render, screen } from '@testing-library/react';
// Importa o componente principal da aplicação
import App from './App';

// Define um teste chamado 'renders learn react link'
test('renders learn react link', () => {
  // Renderiza o componente <App /> no ambiente de teste
  render(<App />);
  
  // Busca um elemento na tela que contenha o texto 'learn react' (não diferencia maiúsculas e minúsculas)
  const linkElement = screen.getByText(/learn react/i);
  
  // Verifica se o elemento encontrado está presente no DOM
  expect(linkElement).toBeInTheDocument();
});
