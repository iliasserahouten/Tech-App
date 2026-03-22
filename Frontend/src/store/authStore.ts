import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initAuth: () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && token !== 'undefined' && userData && userData !== 'undefined') {
        try {
          const user = JSON.parse(userData);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (parseError) {
          console.error('Erreur de parsing du user:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Erreur dans initAuth:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));