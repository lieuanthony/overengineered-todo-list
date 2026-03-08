import { Router } from "express";
import { getMe, updateMe } from "@/controllers/user.controller";
import { authenticateToken } from "@/middleware/auth.middleware";

const router = Router();

router.get("/me", authenticateToken, getMe);
router.put("/me", authenticateToken, updateMe);

export default router;