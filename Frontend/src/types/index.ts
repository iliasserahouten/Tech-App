// ==================== AUTH ====================
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

// ==================== ENUMS ====================
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type BookStatus = 'AVAILABLE' | 'LOANED' | 'RESERVED';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'LATE';

// ==================== SCHOOL ====================
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

// ==================== CLASSROOM ====================
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
  _count?: {
    students: number;
    books: number;
  };
}

// ==================== STUDENT ====================
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classroomId: string;
  createdAt: string;
  updatedAt: string;
  classroom?: Classroom;
}

// ==================== BOOK ====================
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
  currentLoan?: Loan;
}

// ==================== LOAN ====================
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

// ==================== RESERVATION ====================
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

// ==================== CLASS SCHEDULE ====================
export interface ClassSchedule {
  id: string;
  dayOfWeek: DayOfWeek;
  teacherId: string;
  classroomId: string;
  teacher?: User;
  classroom?: Classroom;
}

// ==================== RECENT ACTIVITY ====================
export interface RecentActivity {
  id: string;
  type: 'borrow' | 'return';
  studentName: string;
  bookTitle: string;
  timestamp: string;
  student?: Student;
  book?: Book;
}

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  totalBorrowed: number;
  totalOverdue: number;
  totalAvailable: number;
  totalBooks: number;
  totalStudents: number;
  activeLoans: Loan[];
  recentActivities: RecentActivity[];
}

// ==================== API RESPONSES ====================
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