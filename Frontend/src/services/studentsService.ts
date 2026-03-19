import api from '../lib/axios';
import { Student } from '../types';

function extract<T>(response: any): T {
  return response.data?.data ?? response.data;
}

function extractArray<T>(response: any): T[] {
  return response.data?.data ?? response.data ?? [];
}

export const studentsService = {

  // Élèves d'une classe → { data: [...] }
  async getStudentsByClassroom(classroomId: string): Promise<Student[]> {
    const response = await api.get(`/classrooms/${classroomId}/students`);
    return extractArray<Student>(response);
  },

  // Créer un élève
  async createStudent(data: {
    firstName: string;
    lastName: string;
    classroomId: string;
  }): Promise<Student> {
    const { classroomId, ...rest } = data;
    const response = await api.post(`/classrooms/${classroomId}/students`, rest);
    return extract<Student>(response);
  },

  // Supprimer un élève
  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};