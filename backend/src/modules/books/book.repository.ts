import prisma from "../../config/prisma";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

const bookInclude = {
  classroom: {
    select: {
      name: true,
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
      include: bookInclude, 
    });
  }

  findAllByClassroom(classroomId: string) {
    return prisma.book.findMany({
      where: { classroomId },
      orderBy: { createdAt: "desc" },
      include: bookInclude,  
    });
  }

  findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: bookInclude,  
    });
  }

  findByQrToken(qrToken: string) {
    return prisma.book.findUnique({
      where: { qrToken },
      include: bookInclude,  
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
      include: bookInclude,  
    });
  }

  deleteById(id: string) {
    return prisma.book.delete({ where: { id } });
  }
}