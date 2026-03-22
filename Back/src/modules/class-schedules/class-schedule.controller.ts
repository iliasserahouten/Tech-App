import { Request, Response, NextFunction } from "express";
import { ClassScheduleService } from "./class-schedule.service";

export class ClassScheduleController {
  constructor(private service = new ClassScheduleService()) {}

  getTodayClassroom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = req.user!.id;
      const data = await this.service.getTodayClassroom(teacherId);
      
      if (!data) {
        return res.status(404).json({ message: "No classroom scheduled for today" });
      }
      
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  };
  upsertSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const { classroomId, dayOfWeek } = req.body;
    if (!classroomId || !dayOfWeek) {
      return res.status(400).json({ error: { message: "classroomId and dayOfWeek are required" } });
    }
    const data = await this.service.upsertSchedule(teacherId, classroomId, dayOfWeek);
    return res.status(201).json({ data });
  } catch (err) {
    return next(err);
  }
};

  getMySchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const teacherId = req.user!.id;
      const data = await this.service.getMySchedule(teacherId);
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  };
}