import {
  getFieldErrors,
  loginSchema,
  registerSchema,
  type FieldErrors,
  type LoginInput,
  type RegisterInput,
} from '../schemas/auth.schema';
import type { PublicUser, User } from '../types/auth';
import { hashPassword, verifyPassword } from './passwordHasher';
import { clearSession, loadSession, loadUsers, saveSession, saveUsers } from './storage';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type RegisterResult =
  | { ok: true; user: PublicUser }
  | { ok: false; code: 'VALIDATION'; fieldErrors: FieldErrors }
  | { ok: false; code: 'EMAIL_TAKEN' };

export type LoginResult =
  | { ok: true; user: PublicUser }
  | { ok: false; code: 'VALIDATION'; fieldErrors: FieldErrors }
  | { ok: false; code: 'INVALID_CREDENTIALS' };


function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    balance: user.balance,
    createdAt: user.createdAt,
  };
}

function startSession(userId: string): void {
  saveSession({ userId, expiresAt: Date.now() + SESSION_TTL_MS });
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', fieldErrors: getFieldErrors(parsed.error) };
  }

  const { fullName, email, password } = parsed.data;
  const users = loadUsers();
  if (users.some((user) => user.email === email)) {
    return { ok: false, code: 'EMAIL_TAKEN' };
  }

  const user: User = {
    id: crypto.randomUUID(),
    fullName,
    email,
    password: await hashPassword(password),
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  startSession(user.id);
  return { ok: true, user: toPublicUser(user) };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', fieldErrors: getFieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;
  const user = loadUsers().find((candidate) => candidate.email === email);

  if (!user) {
    await hashPassword(password);
    return { ok: false, code: 'INVALID_CREDENTIALS' };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { ok: false, code: 'INVALID_CREDENTIALS' };
  }

  startSession(user.id);
  return { ok: true, user: toPublicUser(user) };
}

export function getCurrentUser(): PublicUser | null {
  const session = loadSession();
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    clearSession();
    return null;
  }

  const user = loadUsers().find((candidate) => candidate.id === session.userId);
  if (!user) {
    clearSession();
    return null;
  }
  return toPublicUser(user);
}

export function logout(): void {
  clearSession();
}