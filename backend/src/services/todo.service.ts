import {
  findTodosByUserId,
  findTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../models/todo.model";

export const getTodos = (userId: string) => findTodosByUserId(userId);

export const addTodo = async (userId: string, title: string, dueDate?: string) => {
  if (!title?.trim()) throw new Error("Title is required");
  return createTodo(userId, title.trim(), dueDate ? new Date(dueDate) : undefined);
};

export const editTodo = async (id: string, userId: string, data: { title?: string; completed?: boolean; dueDate?: string | null }) => {
  const todo = await findTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");
  if (data.title !== undefined && !data.title.trim()) throw new Error("Title cannot be empty");

  const update: { title?: string; completed?: boolean; dueDate?: Date | null } = {
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.completed !== undefined && { completed: data.completed }),
    ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
  };

  return updateTodo(id, userId, update);
};

export const removeTodo = async (id: string, userId: string) => {
  const todo = await findTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");
  return deleteTodo(id, userId);
};