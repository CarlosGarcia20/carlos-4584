import type { PasswordHash } from "../types/auth";

const ALGORITHM = 'PBKDF2-SHA256';
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;


const encoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function derive(
    password: string,
    salt: BufferSource,
    iterations: number,
): Promise<Uint8Array> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
        keyMaterial,
        HASH_BITS,
    );
    return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
    }
    return diff === 0;
}

export async function hashPassword(password: string): Promise<PasswordHash> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const hash = await derive(password, salt, ITERATIONS);
    return {
        algorithm: ALGORITHM,
        iterations: ITERATIONS,
        salt: toBase64(salt),
        hash: toBase64(hash),
    };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
    const actual = await derive(password, fromBase64(stored.salt), stored.iterations);
    return timingSafeEqual(actual, fromBase64(stored.hash));
}