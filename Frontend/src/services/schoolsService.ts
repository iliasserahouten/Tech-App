import api from '../lib/axios';
import { School } from '../types';

export const schoolsService = {

  // Liste des écoles de l'enseignant
  async getMySchools(): Promise<School[]> {
    const response = await api.get<School[]>('/schools');
    return response.data;
  },

  // Créer une école
  async createSchool(data: {
    name: string;
    city?: string;
  }): Promise<School> {
    const response = await api.post<School>('/schools', data);
    return response.data;
  },

  // Supprimer une école
  async deleteSchool(id: string): Promise<void> {
    await api.delete(`/schools/${id}`);
  },
};