import { AppError } from "../../errors/app-error";
import { ReservationRepository } from "./reservation.repository";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ReservationResponseDto } from "./dto/reservation-response.dto";

function toDto(r: any): ReservationResponseDto {
  return {
    id: r.id,
    desiredFrom: r.desiredFrom ? r.desiredFrom.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    book: r.book,
    student: r.student,
  };
}

export class ReservationService {
  constructor(private repo = new ReservationRepository()) {}

  async create(teacherId: string, dto: CreateReservationDto) {
    if (!dto.qrToken?.trim())   throw new AppError("qrToken is required", 400);
    if (!dto.studentId?.trim()) throw new AppError("studentId is required", 400);

    const book = await this.repo.findBookByQrForTeacher(teacherId, dto.qrToken.trim());
    if (!book) throw new AppError("Book not found", 404);

    if (book.status === "AVAILABLE") {
      throw new AppError("Book is available, borrow it directly", 400);
    }

    const existing = await this.repo.findExistingReservation(book.id);
    if (existing) throw new AppError("A reservation already exists for this book", 409);

    const student = await this.repo.findStudentForTeacher(teacherId, dto.studentId.trim());
    if (!student) throw new AppError("Student not found", 404);

    const sameSchool = book.classroom.school.id === student.classroom.school.id;
    if (!sameSchool) throw new AppError("Student cannot reserve this book (different school)", 403);

    const sameClassroom = book.classroom.id === student.classroom.id;
    if (!sameClassroom) throw new AppError("Student cannot reserve this book (different class)", 403);

    const activeLoan = await this.repo.findActiveLoanByBook(book.id);
    if (activeLoan && activeLoan.studentId === student.id) { throw new AppError("Cet élève a déjà emprunté ce livre", 409);}
    const desiredFrom = dto.desiredFrom ? new Date(dto.desiredFrom) : null;
    
    if (dto.desiredFrom && isNaN(desiredFrom!.getTime())) { throw new AppError("desiredFrom must be a valid ISO date", 400);}

    const created = await this.repo.createReservation({ teacherId, bookId: book.id, studentId: student.id, desiredFrom, });

    return toDto(created);
  }

  async listByBook(teacherId: string, bookId: string) {
    const items = await this.repo.listByBook(teacherId, bookId);
    return items.map(toDto);
  }

  async cancel(teacherId: string, reservationId: string) {
    const exists = await this.repo.findByIdForTeacher(teacherId, reservationId);
    if (!exists) throw new AppError("Reservation not found", 404);
    await this.repo.deleteById(reservationId);
    await this.repo.setBookStatus(exists.bookId as string, "AVAILABLE");
    return { deleted: true };
  }

  async cancelByQr(teacherId: string, qrToken: string) {
  const book = await this.repo.findBookByQrForTeacher(teacherId, qrToken);
  if (!book) throw new AppError("Book not found", 404);

  const reservation = await this.repo.findExistingReservation(book.id);
  if (!reservation) throw new AppError("No reservation found for this book", 404);

  await this.repo.deleteById(reservation.id);
  await this.repo.setBookStatus(book.id, "AVAILABLE");

  return { deleted: true };
}
}