import { Router } from "express";
import { ReservationController } from "./reservation.controller";

const router = Router();
const controller = new ReservationController();

router.post("/reservations", controller.create);
router.get("/books/:bookId/reservations", controller.listByBook);
router.delete("/reservations/:id", controller.cancel);

export default router;
