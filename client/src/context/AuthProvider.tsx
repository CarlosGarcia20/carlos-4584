import { useCallback, useMemo, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { AuthContext, type AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState(() => authService.getCurrentUser());

   const register = useCallback<AuthContextValue['register']>(async (input) => {
      const result = await authService.register(input);
      if (result.ok) setUser(result.user);
      return result;
   }, []);

   const login = useCallback<AuthContextValue['login']>(async (input) => {
      const result = await authService.login(input);
      if (result.ok) setUser(result.user);
      return result;
   }, []);

   const logout = useCallback(() => {
      authService.logout();
      setUser(null);
   }, []);

   const addFunds = useCallback((amount: number) => {
      setUser(authService.addFunds(amount));
   }, []);


   const value = useMemo(
      () => ({ user, register, login, logout, addFunds }),
      [user, register, login, logout],
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}