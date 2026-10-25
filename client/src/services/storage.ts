import { z } from 'zod';
import type { Session, User } from '../types/auth';

export const STORAGE_KEYS = {
    users: 'snail:users',
    session: 'snail:session',
} as const;

const userSchema: z.ZodType<User> = z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    password: z.object({
        algorithm: z.literal('PBKDF2-SHA256'),
        iterations: z.number().int().positive(),
        salt: z.string(),
        hash: z.string(),
    }),
    balance: z.number(),
    createdAt: z.string(),
});

const sessionSchema: z.ZodType<Session> = z.object({
    userId: z.string(),
    expiresAt: z.number(),
});

function readJson<T>(key: string, schema: z.ZodType<T>): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        const parsed = schema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}

export function loadUsers(): User[] {
    return readJson(STORAGE_KEYS.users, z.array(userSchema)) ?? [];
}

export function saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function loadSession(): Session | null {
    return readJson(STORAGE_KEYS.session, sessionSchema);
}

export function saveSession(session: Session): void {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

export function clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.session);
}

export interface PaymentCard {
    cardNumber: string;
    cvv: string;
}

export const paymentCardKey = (userId: string) => `snail:card:${userId}`;

export function savePaymentCard(userId: string, card: PaymentCard): void {
    localStorage.setItem(paymentCardKey(userId), JSON.stringify(card));
}