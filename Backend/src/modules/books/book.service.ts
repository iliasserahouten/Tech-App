import prisma from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { BookRepository } from "./book.repository";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { BookResponseDto } from "./dto/book-response.dto";
import crypto from "crypto";

function toDto(b: any): BookResponseDto {
  return {
    id: b.id,
    title: b.title,
    universe: b.universe,
    publisher: b.publisher,
    status: b.status,
    qrToken: b.qrToken,
    classroomId: b.classroomId,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export class BookService {
  constructor(private repo = new BookRepository()) {}

  private async ensureClassroomOwnership(teacherId: string, classroomId: string) {
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, school: { teacherId } },
      select: { id: true },
    });
    if (!classroom) throw new AppError("Classroom not found", 404);
  }

  private async ensureBookOwnership(teacherId: string, bookId: string) {
    const book = await prisma.book.findFirst({
      where: { id: bookId, classroom: { school: { teacherId } } },
    });
    if (!book) throw new AppError("Book not found", 404);
    return book;
  }

  private async ensureBookOwnershipByQr(teacherId: string, qrToken: string) {
    const book = await prisma.book.findFirst({
      where: { qrToken, classroom: { school: { teacherId } } },
    });
    if (!book) throw new AppError("Book not found", 404);
    return book;
  }

  private generateQrToken(): string {
    // short, unique enough, URL-safe
    return crypto.randomBytes(16).toString("hex");
  }

  async createBook(teacherId: string, classroomId: string, dto: CreateBookDto) {
    if (!dto.title?.trim()) throw new AppError("title is required", 400);

    await this.ensureClassroomOwnership(teacherId, classroomId);

    const qrToken = this.generateQrToken();
    const created = await this.repo.create(classroomId, qrToken, {
      title: dto.title.trim(),
      universe: dto.universe,
      publisher: dto.publisher,
    });

    return toDto(created);
  }

  async listBooks(teacherId: string, classroomId: string) {
    await this.ensureClassroomOwnership(teacherId, classroomId);
    const items = await this.repo.findAllByClassroom(classroomId);
    return items.map(toDto);
  }

  async getBookById(teacherId: string, bookId: string) {
    const book = await this.ensureBookOwnership(teacherId, bookId);
    return toDto(book);
  }

  async updateBook(teacherId: string, bookId: string, dto: UpdateBookDto) {
    await this.ensureBookOwnership(teacherId, bookId);

    const cleaned: UpdateBookDto = {
      ...(dto.title !== undefined ? { title: dto.title?.trim() } : {}),
      ...(dto.universe !== undefined ? { universe: dto.universe } : {}),
      ...(dto.publisher !== undefined ? { publisher: dto.publisher } : {}),
    };

    if (cleaned.title !== undefined && !cleaned.title) {
      throw new AppError("title cannot be empty", 400);
    }

    const updated = await this.repo.updateById(bookId, cleaned);
    return toDto(updated);
  }

  async deleteBook(teacherId: string, bookId: string) {
    await this.ensureBookOwnership(teacherId, bookId);
    await this.repo.deleteById(bookId);
    return { deleted: true };
  }

  async getBookByQrToken(teacherId: string, qrToken: string) {
    const book = await this.ensureBookOwnershipByQr(teacherId, qrToken);
    return toDto(book);
  }
}
