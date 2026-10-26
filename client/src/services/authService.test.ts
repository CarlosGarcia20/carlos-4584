import { afterEach, describe, expect, it, vi } from 'vitest';
import { addFunds, getCurrentUser, login, logout, register } from './authService';
import { STORAGE_KEYS } from './storage';

const validInput = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  password: 'Caracol123',
  confirmPassword: 'Caracol123',
};

afterEach(() => {
  vi.useRealTimers();
});

describe('register', () => {
  it('crea el usuario con saldo 0 y abre sesión', async () => {
    const result = await register(validInput);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.balance).toBe(0);
    expect(result.user.email).toBe('ana@example.com');
    expect(getCurrentUser()?.id).toBe(result.user.id);
  });

  it('no guarda la contraseña en texto plano', async () => {
    await register(validInput);

    const stored = localStorage.getItem(STORAGE_KEYS.users) ?? '';
    expect(stored).not.toContain('Caracol123');
    expect(stored).toContain('PBKDF2-SHA256');
  });

  it('no expone el hash en el usuario público', async () => {
    const result = await register(validInput);
    expect(result.ok && 'password' in result.user).toBe(false);
  });

  it('rechaza contraseñas que no coinciden', async () => {
    const result = await register({ ...validInput, confirmPassword: 'Otra12345' });

    expect(result.ok).toBe(false);
    if (result.ok || result.code !== 'VALIDATION') return;
    expect(result.fieldErrors.confirmPassword).toBeDefined();
  });

  it.each([
    ['fullName', 'Ana', 'fullName'],
    ['email', 'no-es-correo', 'email'],
    ['password', 'corta1', 'password'],
    ['password', 'sololetrasaqui', 'password'],
  ] as const)('rechaza %s inválido: %s', async (field, value, errorField) => {
    const result = await register({ ...validInput, [field]: value, confirmPassword: value });

    expect(result.ok).toBe(false);
    if (result.ok || result.code !== 'VALIDATION') return;
    expect(result.fieldErrors[errorField]).toBeDefined();
  });

  it('rechaza un correo ya registrado sin importar mayúsculas', async () => {
    await register(validInput);
    const result = await register({ ...validInput, email: 'ANA@Example.com' });

    expect(result).toEqual({ ok: false, code: 'EMAIL_TAKEN' });
  });
});

describe('login', () => {
  it('inicia sesión con los datos registrados', async () => {
    await register(validInput);
    logout();

    const result = await login({ email: 'ana@example.com', password: 'Caracol123' });

    expect(result.ok).toBe(true);
    expect(getCurrentUser()?.email).toBe('ana@example.com');
  });

  it('rechaza una contraseña incorrecta y no abre sesión', async () => {
    await register(validInput);
    logout();

    const result = await login({ email: 'ana@example.com', password: 'Incorrecta1' });

    expect(result).toEqual({ ok: false, code: 'INVALID_CREDENTIALS' });
    expect(getCurrentUser()).toBeNull();
  });

  it('da el mismo error si el correo no existe', async () => {
    const result = await login({ email: 'nadie@example.com', password: 'Caracol123' });
    expect(result).toEqual({ ok: false, code: 'INVALID_CREDENTIALS' });
  });
});

describe('sesión', () => {
  it('sobrevive a una recarga porque se lee de LocalStorage', async () => {
    await register(validInput);
    // Una recarga vuelve a ejecutar getCurrentUser leyendo solo del almacenamiento.
    expect(getCurrentUser()?.email).toBe('ana@example.com');
  });

  it('logout cierra la sesión pero conserva al usuario', async () => {
    await register(validInput);
    logout();

    expect(getCurrentUser()).toBeNull();
    const result = await login({ email: 'ana@example.com', password: 'Caracol123' });
    expect(result.ok).toBe(true);
  });

  it('una sesión vencida ya no da acceso', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-21T10:00:00Z'));
    await register(validInput);

    vi.setSystemTime(new Date('2026-10-22T10:00:01Z'));
    expect(getCurrentUser()).toBeNull();
  });

  it('ignora datos corruptos en LocalStorage', () => {
    localStorage.setItem(STORAGE_KEYS.session, '{no es json');
    localStorage.setItem(STORAGE_KEYS.users, '[1,2,3]');
    expect(getCurrentUser()).toBeNull();
  });
});

describe('addFunds', () => {
  it('suma al saldo y lo conserva', async () => {
    await register(validInput);

    addFunds(500);

    expect(getCurrentUser()?.balance).toBe(500);
  });

  it('evita errores de punto flotante', async () => {
    await register(validInput);

    addFunds(0.1);
    addFunds(0.2);

    expect(getCurrentUser()?.balance).toBe(0.3);
  });

  it.each([0, -10, Number.NaN])('rechaza el monto %s', async (amount) => {
    await register(validInput);

    expect(() => addFunds(amount)).toThrow();
    expect(getCurrentUser()?.balance).toBe(0);
  });

  it('no hace nada si no hay sesión', () => {
    expect(addFunds(100)).toBeNull();
  });
});
