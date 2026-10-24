import { createContext } from 'react';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';
import type { LoginResult, RegisterResult } from '../services/authService';
import type { PublicUser } from '../types/auth';

export interface AuthContextValue {
  user: PublicUser | null;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  login: (input: LoginInput) => Promise<LoginResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);