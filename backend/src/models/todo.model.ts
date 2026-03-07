import prisma from "@/config/prisma";
import { TodoModel } from "@/generated/models";

export const findTodosByUserId = async (userId: string): Promise<TodoModel[]> =>
  prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

export const findTodoById = async (id: string, userId: string): Promise<TodoModel | null> =>
  prisma.todo.findFirst({ where: { id, userId } });

export const createTodo = async (userId: string, title: string, dueDate?: Date): Promise<TodoModel> =>
  prisma.todo.create({ data: { userId, title, ...(dueDate && { dueDate }) } });

export const updateTodo = async (id: string, userId: string, data: { title?: string; completed?: boolean; dueDate?: Date | null }): Promise<TodoModel> =>
  prisma.todo.update({ where: { id }, data });

export const deleteTodo = async (id: string, userId: string): Promise<TodoModel> =>
  prisma.todo.delete({ where: { id } });