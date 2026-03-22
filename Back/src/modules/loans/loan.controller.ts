import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error";
import { LoanService } from "./loan.service";

type BookParams = { bookId: string };

export class LoanController {
  constructor(private service = new LoanService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.user!.id;
    if (!teacherId) throw new AppError("Missing x-teacher-id header", 401);
    return teacherId;
  }

  borrow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.borrow(teacherId, req.body);
      return res.status(201).json({ data });
    } catch (err) {
      return next(err);
    }
  };

  returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.returnBook(teacherId, req.body);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  historyByBook = async (req: Request<BookParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { bookId } = req.params;
      const data = await this.service.historyByBook(teacherId, bookId);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };
  listAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { status, studentId, bookId, classroomId } = req.query as Record<string, string>;
      const data = await this.service.listAll(teacherId, { status, studentId, bookId, classroomId });
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };
}
