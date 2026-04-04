import prisma from "../../config/prisma";
import { CreateClassroomDto } from "./dto/create-classroom.dto";
import { UpdateClassroomDto } from "./dto/update-classroom.dto";

export class ClassroomRepository {
  create(schoolId: string, dto: CreateClassroomDto) {
    return prisma.classroom.create({
      data: {
        name: dto.name,
        schoolId,
      },
    });
  }

  findAllBySchool(schoolId: string) {
    return prisma.classroom.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.classroom.findUnique({
      where: { id },
    });
  }

  updateById(id: string, dto: UpdateClassroomDto) {
    return prisma.classroom.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
     
      },
    });
  }

  deleteById(id: string) {
    return prisma.classroom.delete({
      where: { id },
    });
  }
}
