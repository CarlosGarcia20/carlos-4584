import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { logout, register } from './services/authService';
import { STORAGE_KEYS } from './services/storage';

const validInput = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  password: 'Caracol123',
  confirmPassword: 'Caracol123',
};

// La sesión se prepara con el servicio y luego se monta la app,
// igual que ocurre al recargar la página.
function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

const SLOW = { timeout: 5000 }; // el hash de contraseña tarda unos cientos de ms

describe('rutas y sesión', () => {
  it('sin sesión, /dashboard redirige al login', () => {
    renderApp('/dashboard');
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('con sesión, /login redirige al dashboard', async () => {
    await register(validInput);
    renderApp('/login');
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('registrarse desde la interfaz lleva al dashboard con saldo $0.00', async () => {
    const actor = userEvent.setup();
    renderApp('/register');

    await actor.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await actor.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await actor.type(screen.getByLabelText('Contraseña'), 'Caracol123');
    await actor.type(screen.getByLabelText('Confirmar contraseña'), 'Caracol123');
    await actor.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Ana Pérez', {}, SLOW)).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('cerrar sesión vuelve al login y borra la sesión', async () => {
    const actor = userEvent.setup();
    await register(validInput);
    renderApp('/dashboard');

    await actor.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('muestra un mensaje genérico con contraseña incorrecta', async () => {
    const actor = userEvent.setup();
    await register(validInput);
    logout();
    renderApp('/login');

    await actor.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await actor.type(screen.getByLabelText('Contraseña'), 'Incorrecta1');
    await actor.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert', {}, SLOW)).toHaveTextContent(
      'Correo o contraseña incorrectos',
    );
  });
});
