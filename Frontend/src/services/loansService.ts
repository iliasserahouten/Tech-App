import api from '../lib/axios';
import { Loan } from '../types';

function extractArray<T>(response: any): T[] {
  return response.data?.data ?? response.data ?? [];
}

export interface LoanFilters {
  status?: string;
  studentId?: string;
  bookId?: string;
  classroomId?: string;
}

export const loansService = {
  async getAllLoans(filters: LoanFilters = {}): Promise<Loan[]> {
    const params = new URLSearchParams();
    if (filters.status)      params.append('status',      filters.status);
    if (filters.studentId)   params.append('studentId',   filters.studentId);
    if (filters.bookId)      params.append('bookId',      filters.bookId);
    if (filters.classroomId) params.append('classroomId', filters.classroomId);

    const response = await api.get(`/loans?${params.toString()}`);
    return extractArray<Loan>(response);
  },
};