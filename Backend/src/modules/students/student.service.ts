import prisma from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import { StudentRepository } from "./student.repository";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentResponseDto } from "./dto/student-response.dto";

function toDto(s: any): StudentResponseDto {
  return {
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    classroomId: s.classroomId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export class StudentService {
  constructor(private repo = new StudentRepository()) {}

  private async ensureClassroomOwnership(teacherId: string, classroomId: string) {
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, school: { teacherId } },
      select: { id: true },
    });
    if (!classroom) throw new AppError("Classroom not found", 404);
  }

  private async ensureStudentOwnership(teacherId: string, studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, classroom: { school: { teacherId } } },
    });
    if (!student) throw new AppError("Student not found", 404);
    return student;
  }

  async createStudent(teacherId: string, classroomId: string, dto: CreateStudentDto) {
    if (!dto.firstName?.trim()) throw new AppError("firstName is required", 400);
    if (!dto.lastName?.trim()) throw new AppError("lastName is required", 400);

    await this.ensureClassroomOwnership(teacherId, classroomId);

    const created = await this.repo.create(classroomId, {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
    });

    return toDto(created);
  }

  async listStudents(teacherId: string, classroomId: string) {
    await this.ensureClassroomOwnership(teacherId, classroomId);
    const items = await this.repo.findAllByClassroom(classroomId);
    return items.map(toDto);
  }

  async getStudentById(teacherId: string, studentId: string) {
    const student = await this.ensureStudentOwnership(teacherId, studentId);
    return toDto(student);
  }

  async updateStudent(teacherId: string, studentId: string, dto: UpdateStudentDto) {
    await this.ensureStudentOwnership(teacherId, studentId);
    const updated = await this.repo.updateById(studentId, dto);
    return toDto(updated);
  }

  async deleteStudent(teacherId: string, studentId: string) {
    await this.ensureStudentOwnership(teacherId, studentId);
    await this.repo.deleteById(studentId);
    return { deleted: true };
  }
}
