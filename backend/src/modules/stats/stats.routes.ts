import { Router } from "express";
import { StatsController } from "./stats.controller";

const router = Router();
const controller = new StatsController();

router.get("/stats/dashboard", controller.getDashboardStats);
router.get("/stats/classroom/:classroomId", controller.getClassroomStats);

export default router;