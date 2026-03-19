import api from '../lib/axios';
import { Book, Loan, Reservation } from '../types';
import { classroomsService } from './classroomsService';

function extract<T>(response: any): T {
  return response.data?.data ?? response.data;
}

function extractArray<T>(response: any): T[] {
  return response.data?.data ?? response.data ?? [];
}

export const booksService = {

  async getBooks(): Promise<Book[]> {
    const classrooms = await classroomsService.getMyClassrooms();
    const allBooks = await Promise.all(
      classrooms.map(c =>
        api.get(`/classrooms/${c.id}/books`).then(r => extractArray<Book>(r))
      )
    );
    return allBooks.flat();
  },

  async getBooksByClassroom(classroomId: string): Promise<Book[]> {
    const response = await api.get(`/classrooms/${classroomId}/books`);
    return extractArray<Book>(response);
  },

  async getBookByQrToken(qrToken: string): Promise<Book> {
    const response = await api.get(`/books/by-qr/${qrToken}`);
    return extract<Book>(response);
  },

  async getBookById(id: string): Promise<Book> {
    const response = await api.get(`/books/${id}`);
    return extract<Book>(response);
  },

  async createBook(data: {
    title: string;
    universe?: string;
    publisher?: string;
    classroomId: string;
    qrToken?: string;
  }): Promise<Book> {
    const { classroomId, qrToken, ...rest } = data;
    const response = await api.post(
      `/classrooms/${classroomId}/books`,
      { ...rest, ...(qrToken ? { qrToken } : {}) }
    );
    return extract<Book>(response);
  },

  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  },

  // Créer un emprunt → POST /api/loans/borrow
  async createLoan(data: {
    qrToken: string;
    studentId: string;
    dueAt?: string;
  }): Promise<Loan> {
    const response = await api.post('/loans/borrow', data);
    return extract<Loan>(response);
  },

  // Retourner un livre → POST /api/loans/return
  async returnBook(qrToken: string): Promise<Loan> {
    const response = await api.post('/loans/return', { qrToken });
    return extract<Loan>(response);
  },

  // Créer une réservation
  async createReservation(data: {
    bookId: string;
    studentId: string;
    desiredFrom?: string;
  }): Promise<Reservation> {
    const response = await api.post('/reservations', data);
    return extract<Reservation>(response);
  },
};