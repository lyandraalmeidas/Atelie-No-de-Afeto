import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Menu from './components/Menu';

// confirma que o menu renderiza
test('renderiza o nome do ateliê no menu', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Menu />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/Ateliê Nós de Afeto/i)).toBeInTheDocument();
});

// confirma que os links de login e cadastro aparecem para quem não tá logado
test('exibe links de login e cadastro para visitante', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Menu />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/Cadastro/i)).toBeInTheDocument();
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});