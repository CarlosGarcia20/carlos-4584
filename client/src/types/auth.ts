export interface PasswordHash {
    algorithm: 'PBKDF2-SHA256';
    iterations: number;
    salt: string;
    hash: string;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    password: PasswordHash;
    balance: number;
    createdAt: string;
}

export type PublicUser = Omit<User, 'password'>;

export interface Session {
    userId: string;
    expiresAt: number;
}