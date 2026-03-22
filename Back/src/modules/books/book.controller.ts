import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error";
import { BookService } from "./book.service";

type ClassroomParams = { classroomId: string };
type IdParams = { id: string };
type QrParams = { qrToken: string };

export class BookController {
  constructor(private service = new BookService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.user!.id;
    if (!teacherId) throw new AppError("Missing x-teacher-id header", 401);
    return teacherId;
  }

  create = async (req: Request<ClassroomParams, any, any>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { classroomId } = req.params;
      const data = await this.service.createBook(teacherId, classroomId, req.body);
      return res.status(201).json({ data });
    } catch (err) {
      return next(err);
    }
  };

  listByClassroom = async (req: Request<ClassroomParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { classroomId } = req.params;
      const data = await this.service.listBooks(teacherId, classroomId);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  getById = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.getBookById(teacherId, id);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  update = async (req: Request<IdParams, any, any>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.updateBook(teacherId, id, req.body);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  delete = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.deleteBook(teacherId, id);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };

  getByQr = async (req: Request<QrParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { qrToken } = req.params;
      const data = await this.service.getBookByQrToken(teacherId, qrToken);
      return res.json({ data });
    } catch (err) {
      return next(err);
    }
  };
}
