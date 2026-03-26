import prisma from "../../config/prisma";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

const bookInclude = {
  classroom: {
    select: {
      name: true,
      grade: true,
      school: {
        select: {
          name: true,
        },
      },
    },
  },
};

export class BookRepository {
  create(classroomId: string, qrToken: string, dto: CreateBookDto) {
    return prisma.book.create({
      data: {
        title: dto.title,
        universe: dto.universe ?? null,
        publisher: dto.publisher ?? null,
        qrToken,
        classroomId,
      },
      include: bookInclude, // ← ajouter
    });
  }

  findAllByClassroom(classroomId: string) {
    return prisma.book.findMany({
      where: { classroomId },
      orderBy: { createdAt: "desc" },
      include: bookInclude, // ← ajouter
    });
  }

  findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: bookInclude, // ← ajouter
    });
  }

  findByQrToken(qrToken: string) {
    return prisma.book.findUnique({
      where: { qrToken },
      include: bookInclude, // ← ajouter
    });
  }

  updateById(id: string, dto: UpdateBookDto) {
    return prisma.book.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.universe !== undefined ? { universe: dto.universe ?? null } : {}),
        ...(dto.publisher !== undefined ? { publisher: dto.publisher ?? null } : {}),
      },
      include: bookInclude, // ← ajouter
    });
  }

  deleteById(id: string) {
    return prisma.book.delete({ where: { id } });
  }
}