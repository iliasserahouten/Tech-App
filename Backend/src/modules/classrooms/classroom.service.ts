import { AppError } from "../../errors/app-error";
import prisma from "../../config/prisma";
import { ClassroomRepository } from "./classroom.repository";
import { CreateClassroomDto } from "./dto/create-classroom.dto";
import { UpdateClassroomDto } from "./dto/update-classroom.dto";
import { ClassroomResponseDto } from "./dto/classroom-response.dto";

function toDto(c: any): ClassroomResponseDto {
  return {
    id: c.id,
    name: c.name,
    grade: c.grade,
    schoolId: c.schoolId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export class ClassroomService {
  constructor(private repo = new ClassroomRepository()) {}

  private async ensureSchoolOwnership(teacherId: string, schoolId: string) {
    const school = await prisma.school.findFirst({
      where: { id: schoolId, teacherId },
      select: { id: true },
    });
    if (!school) throw new AppError("School not found", 404);
  }

  private async ensureClassroomOwnership(teacherId: string, classroomId: string) {
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, school: { teacherId } },
    });
    if (!classroom) throw new AppError("Classroom not found", 404);
    return classroom;
  }

  async createClassroom(teacherId: string, schoolId: string, dto: CreateClassroomDto) {
    if (!dto.name?.trim()) throw new AppError("name is required", 400);

    await this.ensureSchoolOwnership(teacherId, schoolId);
    const created = await this.repo.create(schoolId, { ...dto, name: dto.name.trim() });
    return toDto(created);
  }

  async listClassrooms(teacherId: string, schoolId: string) {
    await this.ensureSchoolOwnership(teacherId, schoolId);
    const items = await this.repo.findAllBySchool(schoolId);
    return items.map(toDto);
  }

  async getClassroomById(teacherId: string, classroomId: string) {
    const classroom = await this.ensureClassroomOwnership(teacherId, classroomId);
    return toDto(classroom);
  }

  async updateClassroom(teacherId: string, classroomId: string, dto: UpdateClassroomDto) {
    await this.ensureClassroomOwnership(teacherId, classroomId);
    const updated = await this.repo.updateById(classroomId, dto);
    return toDto(updated);
  }

  async deleteClassroom(teacherId: string, classroomId: string) {
    await this.ensureClassroomOwnership(teacherId, classroomId);
    await this.repo.deleteById(classroomId);
    return { deleted: true };
  }
}
