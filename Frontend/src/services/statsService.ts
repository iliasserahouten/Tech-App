import api from '../lib/axios';
import { DashboardStats } from '../types';

function extract<T>(response: any): T {
  return response.data?.data ?? response.data;
}

export const statsService = {

  // Stats globales
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/stats/dashboard');
    return extract<DashboardStats>(response);
  },

  // Stats par classe 
  async getClassroomStats(classroomId: string): Promise<{
    totalBooks: number;
    totalStudents: number;
    activeLoans: number;
    overdueLoans: number;
  }> {
    const response = await api.get(`/stats/classroom/${classroomId}`);
    return extract(response);
  },
};