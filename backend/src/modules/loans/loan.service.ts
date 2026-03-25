import { AppError } from "../../errors/app-error";
import { LoanRepository } from "./loan.repository";
import { BorrowLoanDto } from "./dto/borrow-loan.dto";
import { ReturnLoanDto } from "./dto/return-loan.dto";
import { LoanResponseDto } from "./dto/loan-response.dto";

function toDto(l: any): LoanResponseDto {
  return {
    id: l.id,
    status: l.status,
    borrowedAt: l.borrowedAt.toISOString(),
    dueAt: l.dueAt ? l.dueAt.toISOString() : null,
    returnedAt: l.returnedAt ? l.returnedAt.toISOString() : null,
    book: l.book,
    student: l.student,
  };
}

export class LoanService {
  constructor(private repo = new LoanRepository()) {}

  async borrow(teacherId: string, dto: BorrowLoanDto) {
    if (!dto.qrToken?.trim()) throw new AppError("qrToken is required", 400);
    if (!dto.studentId?.trim()) throw new AppError("studentId is required", 400);

    // 🔹 transaction pour éviter double emprunt
    return this.repo.prisma.$transaction(async (tx) => {
      const book = await this.repo.findBookByQrForTeacher(teacherId, dto.qrToken.trim(), tx);
      if (!book) throw new AppError("Book not found", 404);

      const student = await this.repo.findStudentForTeacher(teacherId, dto.studentId.trim(), tx);
      if (!student) throw new AppError("Student not found", 404);

      // 🚨 🔥 VALIDATION MÉTIER CRITIQUE
      const sameClassroom = book.classroom.id === student.classroom.id;
      const sameSchool = book.classroom.school.id === student.classroom.school.id;

      if (!sameSchool) {
        throw new AppError(
          "Student cannot borrow this book (different school)",
          403
        );
      }

      if (!sameClassroom) {
        throw new AppError(
          "Student cannot borrow this book (same school, but different class)",
          403
        );
      }
      const active = await this.repo.findActiveLoanByBook(book.id, tx);
      if (active) throw new AppError("Book is already loaned", 409);

      const dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
      if (dto.dueAt && isNaN(dueAt!.getTime())) {
        throw new AppError("dueAt must be a valid ISO date", 400);
      }

      const created = await this.repo.createLoan(
        {
          teacherId,
          bookId: book.id,
          studentId: student.id,
          dueAt,
        },
        tx
      );

      await this.repo.setBookStatus(book.id, "LOANED", tx);

      return toDto(created);
    });
  }

  async returnBook(teacherId: string, dto: ReturnLoanDto) {
    if (!dto.qrToken?.trim()) throw new AppError("qrToken is required", 400);

    return this.repo.prisma.$transaction(async (tx) => {
      const book = await this.repo.findBookByQrForTeacher(teacherId, dto.qrToken.trim(), tx);
      if (!book) throw new AppError("Book not found", 404);

      const active = await this.repo.findActiveLoanByBook(book.id, tx);
      if (!active) throw new AppError("No active loan found for this book", 409);

      const now = new Date();
      const status =
        active.dueAt && active.dueAt.getTime() < now.getTime()
          ? "LATE"
          : "RETURNED";

      const closed = await this.repo.closeLoan(
        {
          loanId: active.id,
          status,
          returnedAt: now,
        },
        tx
      );

      await this.repo.setBookStatus(book.id, "AVAILABLE", tx);

      return toDto(closed);
    });
  }

  async historyByBook(teacherId: string, bookId: string) {
    const exists = await this.repo.findBookByIdForTeacher(teacherId, bookId);
    if (!exists) throw new AppError("Book not found", 404);

    const loans = await this.repo.listLoansForBook(teacherId, bookId);
    return loans.map(toDto);
  }

  async listAll(
    teacherId: string,
    filters: {
      status?: string;
      studentId?: string;
      bookId?: string;
      classroomId?: string;
    }
  ) {
    const loans = await this.repo.listAllLoans(teacherId, filters);
    return loans.map(toDto);
  }
}