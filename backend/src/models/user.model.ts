import prisma from "@/config/prisma";

export const findUserById = async (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const findUserWithTodos = async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      todos: {
        select: {
          completed: true,
          completedAt: true,
        },
      },
    },
  });

export const updateUserById = async (id: string, data: { name?: string }) =>
  prisma.user.update({ where: { id }, data });