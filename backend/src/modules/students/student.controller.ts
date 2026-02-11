import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error";
import { StudentService } from "./student.service";

type ClassroomParams = { classroomId: string };
type IdParams = { id: string };

export class StudentController {
  constructor(private service = new StudentService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.header("x-teacher-id");
    if (!teacherId) throw new AppError("Missing x-teacher-id header", 401);
    return teacherId;
  }

  create = async (req: Request<ClassroomParams, any, any>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { classroomId } = req.params;
      const data = await this.service.createStudent(teacherId, classroomId, req.body);
      return res.status(201).json({ data });
    } catch (err) {
      return next(err);
    }
  };

  listByClassroom = async (req: Request<ClassroomParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { classroomId } = req.params;
      const data = await this.service.listStudents(teacherId, classroomId);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.getStudentById(teacherId, id);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  update = async (req: Request<IdParams, any, any>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.updateStudent(teacherId, id, req.body);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  delete = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.deleteStudent(teacherId, id);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };
}
