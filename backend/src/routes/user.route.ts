import { Router } from "express";
import { getMe } from "@/controllers/user.controller";
import { authenticateToken } from "@/middleware/auth.middleware";

const router = Router();

router.get("/me", authenticateToken, getMe);

export default router;