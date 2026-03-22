import { Router } from "express";
import { QrCodeController } from "./qrcode.controller";

const router = Router();
const controller = new QrCodeController();

router.post("/books/qrcodes/pdf", controller.generatePdf);

export default router;
