import api from '../lib/axios';
import { DashboardStats } from '../types';

export const statsService = {
  // Obtenir les statistiques du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },

  // Obtenir les statistiques d'une classe
  async getClassroomStats(classroomId: string): Promise<{
    totalBooks: number;
    totalStudents: number;
    activeLoans: number;
    overdueLoans: number;
  }> {
    const response = await api.get(`/stats/classroom/${classroomId}`);
    return response.data;
  },
};