import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error";
import { ClassroomService } from "./classroom.service";

type SchoolParams = { schoolId: string };
type IdParams = { id: string };

export class ClassroomController {
  constructor(private service = new ClassroomService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.user!.id;
    if (!teacherId) throw new AppError("Missing x-teacher-id header", 401);
    return teacherId;
  }

  getMyClassrooms = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.getMyClassrooms(teacherId);
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  };

  create = async (
    req: Request<SchoolParams, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { schoolId } = req.params;

      const data = await this.service.createClassroom(teacherId, schoolId, req.body);
      return res.status(201).json({ data });
    } catch (err) {
      return next(err);
    }
  };

  listBySchool = async (
    req: Request<SchoolParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { schoolId } = req.params;

      const data = await this.service.listClassrooms(teacherId, schoolId);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  getById = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;

      const data = await this.service.getClassroomById(teacherId, id);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  update = async (
    req: Request<IdParams, any, any>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;

      const data = await this.service.updateClassroom(teacherId, id, req.body);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  delete = async (
    req: Request<IdParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;

      const data = await this.service.deleteClassroom(teacherId, id);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };
}