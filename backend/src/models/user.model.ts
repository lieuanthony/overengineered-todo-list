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