import prisma from "../../config/prisma";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

export class StudentRepository {
  create(classroomId: string, dto: CreateStudentDto) {
    return prisma.student.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        classroomId,
      },
    });
  }

  findAllByClassroom(classroomId: string) {
    return prisma.student.findMany({
      where: { classroomId },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }

  findById(id: string) {
    return prisma.student.findUnique({ where: { id } });
  }

  updateById(id: string, dto: UpdateStudentDto) {
    return prisma.student.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
      },
    });
  }

  deleteById(id: string) {
    return prisma.student.delete({ where: { id } });
  }
}
