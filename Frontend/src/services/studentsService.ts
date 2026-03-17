import api from '../lib/axios';
import { Student } from '../types';

export const studentsService = {

  // Élèves d'une classe
  async getStudentsByClassroom(classroomId: string): Promise<Student[]> {
    const response = await api.get<Student[]>(`/classrooms/${classroomId}/students`);
    return response.data;
  },

  // Créer un élève
  async createStudent(data: {
    firstName: string;
    lastName: string;
    classroomId: string;
  }): Promise<Student> {
    const { classroomId, ...rest } = data;
    const response = await api.post<Student>(`/classrooms/${classroomId}/students`, rest);
    return response.data;
  },

  // Supprimer un élève
  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};