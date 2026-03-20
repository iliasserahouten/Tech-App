import { Router } from "express";
import { ClassScheduleController } from "./class-schedule.controller";

const router = Router();
const controller = new ClassScheduleController();

router.get("/class-schedules/today", controller.getTodayClassroom);
router.get("/class-schedules/my-schedule", controller.getMySchedule);
router.post("/class-schedules", controller.upsertSchedule);

export default router;