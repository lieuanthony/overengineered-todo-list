import { Request, Response } from 'express';
import { getTodos, addTodo, editTodo, removeTodo } from '@/services/todo.service';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await getTodos(req.user!.userId);
    res.json(todos);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, dueDate } = req.body;
    const todo = await addTodo(req.user!.userId, title, dueDate);
    res.status(201).json(todo);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Title is required') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, completed, dueDate } = req.body;
    const todo = await editTodo(id, req.user!.userId, { title, completed, dueDate });
    res.json(todo);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Todo not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Title cannot be empty') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await removeTodo(id, req.user!.userId);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Todo not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
