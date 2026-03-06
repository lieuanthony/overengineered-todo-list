import prisma from "../config/prisma";
import { UserModel } from "../generated/models";

export const findUserByEmail = async (email: string): Promise<UserModel | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string): Promise<UserModel | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = async (data: {
  email: string;
  name: string;
  password: string;
}): Promise<UserModel> => {
  return prisma.user.create({
    data,
  });
};