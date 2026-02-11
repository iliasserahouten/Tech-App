import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/app-error";
import { QrCodeService } from "./qrcode.service";

export class QrCodeController {
  constructor(private service = new QrCodeService()) {}

  private getTeacherId(req: Request): string {
    const teacherId = req.header("x-teacher-id");
    if (!teacherId) throw new AppError("Missing x-teacher-id header", 401);
    return teacherId;
  }

  generatePdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacherId = this.getTeacherId(req);
      const { bookIds } = req.body as { bookIds: string[] };

      const pdfBuffer = await this.service.generatePdfForBooks(teacherId, bookIds);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="qrcodes.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (e) {
      return next(e);
    }
  };
}
