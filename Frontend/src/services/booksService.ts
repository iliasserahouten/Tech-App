import api from '../lib/axios';
import { Book, Loan, Reservation } from '../types';
import { classroomsService } from './classroomsService';

export const booksService = {

  // Obtenir tous les livres de toutes mes classes
  async getBooks(): Promise<Book[]> {
    const classrooms = await classroomsService.getMyClassrooms();
    const allBooks = await Promise.all(
      classrooms.map(c =>
        api.get<Book[]>(`/classrooms/${c.id}/books`).then(r => r.data)
      )
    );
    return allBooks.flat();
  },

  // Obtenir les livres d'une classe spécifique
  async getBooksByClassroom(classroomId: string): Promise<Book[]> {
    const response = await api.get<Book[]>(`/classrooms/${classroomId}/books`);
    return response.data;
  },

  // Obtenir un livre par QR token (scanner)
  async getBookByQrToken(qrToken: string): Promise<Book> {
    const response = await api.get<Book>(`/books/by-qr/${qrToken}`);
    return response.data;
  },

  // Obtenir un livre par ID
  async getBookById(id: string): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },

  // Créer un livre dans une classe
  async createBook(data: {
    title: string;
    universe?: string;
    publisher?: string;
    classroomId: string;
  }): Promise<Book> {
    const { classroomId, ...rest } = data;
    const response = await api.post<Book>(`/classrooms/${classroomId}/books`, rest);
    return response.data;
  },

  // Supprimer un livre
  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  },

  // Créer un emprunt → POST /api/loans/borrow
  async createLoan(data: {
    bookId: string;
    studentId: string;
    dueAt?: string;
  }): Promise<Loan> {
    const response = await api.post<Loan>('/loans/borrow', data);
    return response.data;
  },

  // Retourner un livre → POST /api/loans/return
  async returnBook(loanId: string): Promise<Loan> {
    const response = await api.post<Loan>('/loans/return', { loanId });
    return response.data;
  },

  // Créer une réservation
  async createReservation(data: {
    bookId: string;
    studentId: string;
    desiredFrom?: string;
  }): Promise<Reservation> {
    const response = await api.post<Reservation>('/reservations', data);
    return response.data;
  },
};