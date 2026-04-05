import prisma from "../../config/prisma";
import { CreateSchoolDto } from "./dto/create-school.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";

export class SchoolRepository {
  create(teacherId: string, dto: CreateSchoolDto) {
    return prisma.school.create({
      data: {
        name: dto.name,
        city: dto.city ?? null,
        teacherId,
      },
    });
  }

  findAllByTeacher(teacherId: string) {
    return prisma.school.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string, teacherId: string) {
    return prisma.school.findFirst({
      where: { id, teacherId },
    });
  }

  updateById(id: string, teacherId: string, dto: UpdateSchoolDto) {
    return prisma.school.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.city !== undefined ? { city: dto.city ?? null } : {}),
      },
    });
  }

  async deleteById(id: string, teacherId: string) {
    const existing = await this.findById(id, teacherId);
    if (!existing) return null;

    await prisma.school.delete({ where: { id } });
    return existing;
  }
}
