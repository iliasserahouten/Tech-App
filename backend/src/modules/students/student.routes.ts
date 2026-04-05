import { Router } from "express";
import { StudentController } from "./student.controller";

const router = Router();
const controller = new StudentController();


router.post("/classrooms/:classroomId/students", controller.create);
router.get("/classrooms/:classroomId/students", controller.listByClassroom);


router.get("/students/:id", controller.getById);
router.put("/students/:id", controller.update);
router.delete("/students/:id", controller.delete);

export default router;
