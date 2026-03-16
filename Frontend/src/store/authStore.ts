import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

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
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      // Vérifier que les valeurs existent ET ne sont pas "undefined" (string)
      if (token && token !== 'undefined' && userData && userData !== 'undefined') {
        try {
          const user = JSON.parse(userData);
          set({ user, token, isAuthenticated: true });
        } catch (parseError) {
          console.error('Erreur de parsing du user:', parseError);
          // Nettoyer les données corrompues
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isAuthenticated: false });
        }
      } else {
        // Nettoyer les données invalides
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Erreur dans initAuth:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));