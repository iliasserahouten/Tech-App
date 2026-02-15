import api from '../lib/axios';
import { AuthResponse, LoginCredentials, User } from '../types';

export const authService = {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Rejeter l'erreur pour qu'elle soit gérée dans le composant
      throw error;
    }
  },

  // Inscription
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Obtenir le profil actuel
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Changer le mot de passe
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      await api.post('/auth/change-password', data);
    } catch (error: any) {
      throw error;
    }
  },
};