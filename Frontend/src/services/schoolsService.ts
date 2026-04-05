import api from '../lib/axios';
import { School } from '../types';

function extract<T>(response: any): T {
  return response.data?.data ?? response.data;
}

function extractArray<T>(response: any): T[] {
  return response.data?.data ?? response.data ?? [];
}

export const schoolsService = {

  // Liste des écoles 
  async getMySchools(): Promise<School[]> {
    const response = await api.get('/schools');
    return extractArray<School>(response);
  },

  // Créer une école 
  async createSchool(data: {
    name: string;
    city?: string;
  }): Promise<School> {
    const response = await api.post('/schools', data);
    return extract<School>(response);
  },

  // Supprimer une école
  async deleteSchool(id: string): Promise<void> {
    await api.delete(`/schools/${id}`);
  },
};