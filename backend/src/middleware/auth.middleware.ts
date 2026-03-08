import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authenticateRefreshToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401).json({ message: 'No refresh token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
