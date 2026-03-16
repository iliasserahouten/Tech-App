import api from '../lib/axios';
import { Classroom, ClassSchedule, DayOfWeek } from '../types';

export const classroomsService = {
  // Obtenir toutes les classes de l'enseignant
  async getMyClassrooms(): Promise<Classroom[]> {
    const response = await api.get<Classroom[]>('/classrooms/my-classrooms');
    return response.data;
  },

  // Obtenir une classe par ID
  async getClassroomById(id: string): Promise<Classroom> {
    const response = await api.get<Classroom>(`/classrooms/${id}`);
    return response.data;
  },

  // Obtenir le planning de la semaine
  async getMySchedule(): Promise<ClassSchedule[]> {
    const response = await api.get<ClassSchedule[]>('/class-schedules/my-schedule');
    return response.data;
  },

  // Obtenir la classe active du jour
  async getTodayClassroom(): Promise<Classroom | null> {
    try {
      const response = await api.get<Classroom>('/class-schedules/today');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Créer une classe
  async createClassroom(data: {
    name: string;
    grade?: string;
    schoolId: string;
  }): Promise<Classroom> {
    const response = await api.post<Classroom>('/classrooms', data);
    return response.data;
  },

  // Mettre à jour une classe
  async updateClassroom(id: string, data: Partial<{
    name: string;
    grade: string;
  }>): Promise<Classroom> {
    const response = await api.put<Classroom>(`/classrooms/${id}`, data);
    return response.data;
  },

  // Supprimer une classe
  async deleteClassroom(id: string): Promise<void> {
    await api.delete(`/classrooms/${id}`);
  },
};