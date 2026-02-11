import { AppError } from "../../errors/app-error";
import { SchoolRepository } from "./school.repository";
import { CreateSchoolDto } from "./dto/create-school.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";
import { SchoolResponseDto } from "./dto/school-response.dto";

function toSchoolResponse(s: any): SchoolResponseDto {
  return {
    id: s.id,
    name: s.name,
    city: s.city,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export class SchoolService {
  constructor(private repo = new SchoolRepository()) {}

  async createSchool(teacherId: string, dto: CreateSchoolDto): Promise<SchoolResponseDto> {
    if (!dto.name?.trim()) throw new AppError("name is required", 400);

    const created = await this.repo.create(teacherId, { ...dto, name: dto.name.trim() });
    return toSchoolResponse(created);
  }

  async listSchools(teacherId: string): Promise<SchoolResponseDto[]> {
    const schools = await this.repo.findAllByTeacher(teacherId);
    return schools.map(toSchoolResponse);
  }

  async getSchoolById(teacherId: string, id: string): Promise<SchoolResponseDto> {
    const school = await this.repo.findById(id, teacherId);
    if (!school) throw new AppError("School not found", 404);
    return toSchoolResponse(school);
  }

  async updateSchool(teacherId: string, id: string, dto: UpdateSchoolDto): Promise<SchoolResponseDto> {
    const existing = await this.repo.findById(id, teacherId);
    if (!existing) throw new AppError("School not found", 404);

    const updated = await this.repo.updateById(id, teacherId, dto);
    return toSchoolResponse(updated);
  }

  async deleteSchool(teacherId: string, id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.repo.deleteById(id, teacherId);
    if (!deleted) throw new AppError("School not found", 404);
    return { deleted: true };
  }
}
