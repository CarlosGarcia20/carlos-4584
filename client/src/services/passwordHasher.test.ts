import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './passwordHasher';

describe('passwordHasher', () => {
  it('no devuelve la contraseña en texto plano', async () => {
    const stored = await hashPassword('Caracol123');
    expect(JSON.stringify(stored)).not.toContain('Caracol123');
  });

  it('usa un salt distinto en cada llamada', async () => {
    const first = await hashPassword('Caracol123');
    const second = await hashPassword('Caracol123');

    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
  });

  it('verifica la contraseña correcta y rechaza la incorrecta', async () => {
    const stored = await hashPassword('Caracol123');

    expect(await verifyPassword('Caracol123', stored)).toBe(true);
    expect(await verifyPassword('caracol123', stored)).toBe(false);
  });
});
