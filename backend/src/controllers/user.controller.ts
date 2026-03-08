import { Request, Response } from 'express';
import { getUserProfile, updateUser } from '@/services/user.service';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await getUserProfile(req.user!.userId);
    res.json(profile);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (name === undefined) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }
    const user = await updateUser(req.user!.userId, { name });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Name cannot be empty') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
