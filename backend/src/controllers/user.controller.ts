import { Request, Response } from "express";
import { getUserProfile } from "@/services/user.service";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await getUserProfile(req.user!.userId);
    res.json(profile);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};