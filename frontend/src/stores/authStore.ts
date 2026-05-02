import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/index.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName || (user as any).full_name || '',
          },
          token,
          isAuthenticated: true,
        }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'ngo-auth',
      partialize: (state: AuthState) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    } as any
  )
);
