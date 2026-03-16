import api from '../lib/axios';
import { School } from '../types';

export const schoolsService = {
  // Obtenir les écoles de l'enseignant
  async getMySchools(): Promise<School[]> {
    const response = await api.get<School[]>('/schools/my-schools');
    return response.data;
  },

  // Obtenir une école par ID
  async getSchoolById(id: string): Promise<School> {
    const response = await api.get<School>(`/schools/${id}`);
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
};