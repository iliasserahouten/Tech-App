/**import { Router } from "express";
import { ClassroomController } from "./classroom.controller";

const router = Router();
const controller = new ClassroomController();

// nested routes
router.post("/schools/:schoolId/classrooms", controller.create);
router.get("/schools/:schoolId/classrooms", controller.listBySchool);

// single classroom routes
router.get("/classrooms/:id", controller.getById);
router.put("/classrooms/:id", controller.update);
router.delete("/classrooms/:id", controller.delete);

export default router;
**/
import { Router } from "express";
import { ClassroomController } from "./classroom.controller";

const router = Router();
const controller = new ClassroomController();

// /api/schools/:schoolId/classrooms
router.post("/:schoolId/classrooms", controller.create);
router.get("/:schoolId/classrooms", controller.listBySchool);

// /api/schools/classrooms/:id  (car monté sous /api/schools)
router.get("/classrooms/:id", controller.getById);
router.put("/classrooms/:id", controller.update);
router.delete("/classrooms/:id", controller.delete);

export default router;
