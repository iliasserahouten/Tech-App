import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error";
import { ReservationService } from "./reservation.service";

type BookParams = { bookId: string };
type IdParams = { id: string };

export class ReservationController {
  constructor(private service = new ReservationService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.user!.id;
    if (!teacherId) throw new AppError("Missing x-teacher-id header", 401);
    return teacherId;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const data = await this.service.create(teacherId, req.body);
      return res.status(201).json({ data });
    } catch (e) {
      return next(e);
    }
  };


  listByBook = async (req: Request<BookParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { bookId } = req.params;
      const data = await this.service.listByBook(teacherId, bookId);
      return res.json({ data });
    } catch (e) {
      return next(e);
    }
  };

  cancel = async (req: Request<IdParams>, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { id } = req.params;
      const data = await this.service.cancel(teacherId, id);
      return res.json({ data });
    } catch (e) {
      return next(e);
    }
  };

  cancelByQr = async (req: Request<{ qrToken: string }>, res: Response, next: NextFunction) => {
  try {
    const teacherId = this.getTeacherId(req);
    const { qrToken } = req.params;
    const data = await this.service.cancelByQr(teacherId, qrToken);
    return res.json({ data });
  } catch (e) {
    return next(e);
  }
};
}
