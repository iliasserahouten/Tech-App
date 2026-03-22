import { Router } from "express";
import { StudentController } from "./student.controller";

const router = Router();
const controller = new StudentController();

// Nested under /api/classrooms
router.post("/classrooms/:classroomId/students", controller.create);
router.get("/classrooms/:classroomId/students", controller.listByClassroom);

// Single student
router.get("/students/:id", controller.getById);
router.put("/students/:id", controller.update);
router.delete("/students/:id", controller.delete);

export default router;
