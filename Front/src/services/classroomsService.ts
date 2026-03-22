import api from '../lib/axios';
import { Classroom, ClassSchedule } from '../types';

function extract<T>(response: any): T {
  return response.data?.data ?? response.data;
}

function extractArray<T>(response: any): T[] {
  return response.data?.data ?? response.data ?? [];
}

export const classroomsService = {

  // Obtenir toutes les classes du professeur
  async getMyClassrooms(): Promise<Classroom[]> {
    const response = await api.get('/classrooms/my-classrooms');
    return extractArray<Classroom>(response);
  },

  // Obtenir une classe par ID
  async getClassroomById(id: string): Promise<Classroom> {
    const response = await api.get(`/classrooms/${id}`);
    return extract<Classroom>(response);
  },

  // Obtenir le planning
  async getMySchedule(): Promise<ClassSchedule[]> {
    const response = await api.get('/class-schedules/my-schedule');
    return extractArray<ClassSchedule>(response);
  },

  // Classe du jour
  async getTodayClassroom(): Promise<Classroom | null> {
    try {
      const response = await api.get('/class-schedules/today');
      return extract<Classroom>(response);
    } catch (error) {
      return null;
    }
  },

  // ✅ Créer une classe (CORRIGÉ)
  async createClassroom(data: {
    name: string;
    grade?: string;
    schoolId: string;
  }): Promise<Classroom> {
    const response = await api.post(
      `/schools/${data.schoolId}/classrooms`,
      data
    );
    return extract<Classroom>(response);
  },

  // Mettre à jour une classe
  async updateClassroom(
    id: string,
    data: Partial<{
      name: string;
      grade: string;
    }>
  ): Promise<Classroom> {
    const response = await api.put(`/classrooms/${id}`, data);
    return extract<Classroom>(response);
  },

  // Supprimer une classe
  async deleteClassroom(id: string): Promise<void> {
    await api.delete(`/classrooms/${id}`);
  },
};