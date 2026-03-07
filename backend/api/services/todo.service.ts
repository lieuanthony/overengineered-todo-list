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
  return updateTodo(id, userId, {
    ...data,
    dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
  });
};

export const removeTodo = async (id: string, userId: string) => {
  const todo = await findTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");
  return deleteTodo(id, userId);
};