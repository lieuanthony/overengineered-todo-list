import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/auth.model";

const SALT_ROUNDS = 10;

export const registerUser = async (email: string, name: string, password: string) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ email, name, password: hashedPassword });

  return generateTokens(user.id, user.email);
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  return generateTokens(user.id, user.email);
};

export const generateTokens = (userId: string, email: string) => {
  const accessExpiry = (process.env.JWT_EXPIRES_IN || "15m") as string;
  const refreshExpiry = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as string;

  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: accessExpiry as unknown as number }
  );

  const refreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: refreshExpiry as unknown as number }
  );

  return { accessToken, refreshToken };
};