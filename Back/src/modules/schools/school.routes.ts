import { Router } from "express";
import { SchoolController } from "./school.controller";

const router = Router();
const controller = new SchoolController();

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
