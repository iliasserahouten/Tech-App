import prisma from "../../config/prisma";
import { AppError } from "../../errors/app-error";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

export class QrCodeService {
  async generatePdfForBooks(teacherId: string, bookIds: string[]): Promise<Buffer> {
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      throw new AppError("bookIds must be a non-empty array", 400);
    }

    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
        classroom: { school: { teacherId } },
      },
      select: { id: true, title: true, qrToken: true },
      orderBy: { title: "asc" },
    });

    if (books.length === 0) throw new AppError("No books found", 404);

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const endPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // Layout settings
    const cols = 2;
    const qrSize = 140;
    const gap = 30;

    let x = doc.page.margins.left;
    let y = doc.page.margins.top;
    let col = 0;

    doc.fontSize(18).text("QR Codes - Books", { align: "center" });
    doc.moveDown(1);

    y = doc.y + 10;

    for (const b of books) {
      // Generate QR as data URL -> convert to Buffer
      const dataUrl = await QRCode.toDataURL(b.qrToken, { margin: 1, width: qrSize });
      const base64 = dataUrl.split(",")[1];
      const qrBuffer = Buffer.from(base64, "base64");

      // Draw QR
      doc.image(qrBuffer, x, y, { width: qrSize, height: qrSize });

      // Title + token
      doc.fontSize(12).text(b.title, x, y + qrSize + 8, { width: qrSize });
      doc.fontSize(9).fillColor("gray").text(b.qrToken, x, y + qrSize + 26, { width: qrSize });
      doc.fillColor("black");

      // Next cell
      col++;
      if (col >= cols) {
        col = 0;
        x = doc.page.margins.left;
        y += qrSize + 60;
      } else {
        x += qrSize + gap;
      }

      // New page if needed
      if (y + qrSize + 80 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        x = doc.page.margins.left;
        y = doc.page.margins.top;
        col = 0;
      }
    }

    doc.end();
    return await endPromise;
  }
}
