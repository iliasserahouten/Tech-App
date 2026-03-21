import { Router } from "express";
import { LoanController } from "./loan.controller";

const router = Router();
const controller = new LoanController();

router.post("/loans/borrow", controller.borrow);
router.post("/loans/return", controller.returnBook);
router.get("/loans", controller.listAll);         
router.get("/books/:bookId/loans", controller.historyByBook);

export default router;
