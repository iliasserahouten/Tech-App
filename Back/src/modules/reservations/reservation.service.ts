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
    if (!dto.qrToken?.trim()) throw new AppError("qrToken is required", 400);
    if (!dto.studentId?.trim()) throw new AppError("studentId is required", 400);

    const book = await this.repo.findBookByQrForTeacher(teacherId, dto.qrToken.trim());
    if (!book) throw new AppError("Book not found", 404);

    const student = await this.repo.findStudentForTeacher(teacherId, dto.studentId.trim());
    if (!student) throw new AppError("Student not found", 404);

    const desiredFrom = dto.desiredFrom ? new Date(dto.desiredFrom) : null;
    if (dto.desiredFrom && isNaN(desiredFrom!.getTime())) throw new AppError("desiredFrom must be a valid ISO date", 400);

    // Allow reservation anytime for now (MVP). Optionally enforce only when LOANED.
    // if (book.status !== "LOANED") throw new AppError("Book is not currently loaned", 409);

    const created = await this.repo.createReservation({
      teacherId,
      bookId: book.id,
      studentId: student.id,
      desiredFrom,
    });

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
    return { deleted: true };
  }
}
