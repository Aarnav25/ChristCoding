import { create } from 'zustand';

export type UserRole = 'student' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  email: string | null;
  login: (email: string, role: Exclude<UserRole, null>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  email: null,
  login: (email, role) => set({ isAuthenticated: true, email, role }),
  logout: () => set({ isAuthenticated: false, email: null, role: null }),
}));
