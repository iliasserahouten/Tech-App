import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new AuthController();

router.post("/auth/register", controller.register);
router.post("/auth/login", controller.login);
router.get("/auth/me", requireAuth, controller.me);
router.put("/auth/profile", requireAuth, controller.updateProfile);

export default router;
