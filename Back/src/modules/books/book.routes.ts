import { Router } from "express";
import { BookController } from "./book.controller";

const router = Router();
const controller = new BookController();

// Nested under classroom
router.post("/classrooms/:classroomId/books", controller.create);
router.get("/classrooms/:classroomId/books", controller.listByClassroom);

// Book by QR token (scanner)
router.get("/books/by-qr/:qrToken", controller.getByQr);

// Single book
router.get("/books/:id", controller.getById);
router.put("/books/:id", controller.update);
router.delete("/books/:id", controller.delete);

export default router;
