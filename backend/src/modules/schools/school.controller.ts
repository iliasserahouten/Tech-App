import { Request, Response, NextFunction } from "express";
import { SchoolService } from "./school.service";

export class SchoolController {
  constructor(private service = new SchoolService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.header("x-teacher-id");
    if (!teacherId) {
      // later replaced by JWT auth middleware
      throw new Error("Missing x-teacher-id header");
    }
    return teacherId;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.createSchool(teacherId, req.body);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.listSchools(teacherId);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.getSchoolById(teacherId, req.params.id as string);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.updateSchool(teacherId, req.params.id as string, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.deleteSchool(teacherId, req.params.id as string);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };
}
