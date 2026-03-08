import { Request, Response } from 'express';
import { registerUser, loginUser, generateTokens } from '@/services/auth.service';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../middleware/auth.middleware';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const { accessToken, refreshToken } = await registerUser(email, name, password);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ accessToken });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Email already in use') {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const { accessToken, refreshToken } = await loginUser(email, password);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    const { accessToken, refreshToken } = generateTokens(payload.userId, payload.email);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ message: 'Logged out' });
};
