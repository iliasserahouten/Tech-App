// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Enums
export type BookStatus = 'AVAILABLE' | 'LOANED' | 'RESERVED';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'LATE';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Types pour les écoles
export interface School {
  id: string;
  name: string;
  city: string | null;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher?: User;
  classrooms?: Classroom[];
}

export interface CreateSchoolDto {
  name: string;
  city?: string;
}

// Types pour les classes
export interface Classroom {
  id: string;
  name: string;
  grade: string | null;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  school?: School;
  students?: Student[];
  books?: Book[];
}

export interface CreateClassroomDto {
  name: string;
  grade?: string;
  schoolId: string;
}

// Types pour les étudiants
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classroomId: string;
  createdAt: string;
  updatedAt: string;
  classroom?: Classroom;
  loans?: Loan[];
  reservations?: Reservation[];
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  classroomId: string;
}

// Types pour les livres
export interface Book {
  id: string;
  title: string;
  universe: string | null;
  publisher: string | null;
  status: BookStatus;
  qrToken: string;
  classroomId: string;
  createdAt: string;
  updatedAt: string;
  classroom?: Classroom;
  loans?: Loan[];
  reservations?: Reservation[];
}

export interface CreateBookDto {
  title: string;
  universe?: string;
  publisher?: string;
  classroomId: string;
}

// Types pour les emprunts
export interface Loan {
  id: string;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string | null;
  returnedAt: string | null;
  bookId: string;
  studentId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  book?: Book;
  student?: Student;
  teacher?: User;
}

export interface CreateLoanDto {
  bookId: string;
  studentId: string;
  dueAt?: string;
}

// Types pour les réservations
export interface Reservation {
  id: string;
  desiredFrom: string | null;
  bookId: string;
  studentId: string;
  teacherId: string;
  createdAt: string;
  book?: Book;
  student?: Student;
  teacher?: User;
}

export interface CreateReservationDto {
  bookId: string;
  studentId: string;
  desiredFrom?: string;
}

// Types pour l'emploi du temps
export interface ClassSchedule {
  id: string;
  dayOfWeek: DayOfWeek;
  teacherId: string;
  classroomId: string;
  teacher?: User;
  classroom?: Classroom;
}

export interface CreateClassScheduleDto {
  dayOfWeek: DayOfWeek;
  classroomId: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les filtres et pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BookFilters extends PaginationParams {
  status?: BookStatus;
  classroomId?: string;
}

export interface LoanFilters extends PaginationParams {
  status?: LoanStatus;
  studentId?: string;
  bookId?: string;
  teacherId?: string;
}

// Types pour les statistiques
export interface LibraryStats {
  totalBooks: number;
  totalStudents: number;
  totalSchools: number;
  totalClassrooms: number;
  activeLoans: number;
  lateLoans: number;
  availableBooks: number;
  loanedBooks: number;
  reservedBooks: number;
  totalReservations: number;
}