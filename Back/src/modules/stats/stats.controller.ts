import { Request, Response, NextFunction } from "express";
import { StatsService } from "./stats.service";

export class StatsController {
  constructor(private service = new StatsService()) {}

  getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = req.user!.id;
      const data = await this.service.getDashboardStats(teacherId);
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  };

  getClassroomStats = async (
    req: Request<{ classroomId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = req.user!.id;
      const { classroomId } = req.params;
      const data = await this.service.getClassroomStats(teacherId, classroomId);
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  };
}