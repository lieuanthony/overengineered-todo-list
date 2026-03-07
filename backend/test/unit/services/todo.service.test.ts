import "../../mocks/prisma";
import { prismaMock } from "../../mocks/prisma";
import { getTodos, addTodo, editTodo, removeTodo } from "@/services/todo.service";

const mockTodo = {
  id: "todo-123",
  title: "Test todo",
  completed: false,
  dueDate: null,
  userId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("getTodos", () => {
  it("returns todos for a user", async () => {
    prismaMock.todo.findMany.mockResolvedValue([mockTodo]);
    const result = await getTodos("user-123");
    expect(result).toHaveLength(1);
    expect(prismaMock.todo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-123" } })
    );
  });

  it("returns empty array when user has no todos", async () => {
    prismaMock.todo.findMany.mockResolvedValue([]);
    const result = await getTodos("user-123");
    expect(result).toEqual([]);
  });
});

describe("addTodo", () => {
  it("creates and returns a todo", async () => {
    prismaMock.todo.create.mockResolvedValue(mockTodo);
    const result = await addTodo("user-123", "Test todo");
    expect(result).toEqual(mockTodo);
  });

  it("throws when title is empty", async () => {
    await expect(addTodo("user-123", "")).rejects.toThrow("Title is required");
  });

  it("throws when title is only whitespace", async () => {
    await expect(addTodo("user-123", "   ")).rejects.toThrow("Title is required");
  });

  it("trims the title before saving", async () => {
    prismaMock.todo.create.mockResolvedValue(mockTodo);
    await addTodo("user-123", "  Test todo  ");
    expect(prismaMock.todo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ title: "Test todo" }) })
    );
  });

  it("creates a todo with a due date", async () => {
    const withDue = { ...mockTodo, dueDate: new Date("2025-12-31") };
    prismaMock.todo.create.mockResolvedValue(withDue);
    const result = await addTodo("user-123", "Test todo", "2025-12-31");
    expect(result.dueDate).toBeDefined();
  });
});

describe("editTodo", () => {
  it("updates and returns the todo", async () => {
    const updated = { ...mockTodo, title: "Updated title" };
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    prismaMock.todo.update.mockResolvedValue(updated);

    const result = await editTodo("todo-123", "user-123", { title: "Updated title" });
    expect(result.title).toBe("Updated title");
  });

  it("throws when todo is not found", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(null);
    await expect(editTodo("bad-id", "user-123", { title: "x" })).rejects.toThrow("Todo not found");
  });

  it("throws when updated title is empty", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    await expect(editTodo("todo-123", "user-123", { title: "" })).rejects.toThrow("Title cannot be empty");
  });

  it("toggles completed status", async () => {
    const updated = { ...mockTodo, completed: true };
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    prismaMock.todo.update.mockResolvedValue(updated);

    const result = await editTodo("todo-123", "user-123", { completed: true });
    expect(result.completed).toBe(true);
  });

  it("clears due date when null is passed", async () => {
    const updated = { ...mockTodo, dueDate: null };
    prismaMock.todo.findFirst.mockResolvedValue({ ...mockTodo, dueDate: new Date() });
    prismaMock.todo.update.mockResolvedValue(updated);

    const result = await editTodo("todo-123", "user-123", { dueDate: null });
    expect(result.dueDate).toBeNull();
  });
});

describe("removeTodo", () => {
  it("deletes the todo", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    prismaMock.todo.delete.mockResolvedValue(mockTodo);

    await removeTodo("todo-123", "user-123");
    expect(prismaMock.todo.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "todo-123" } })
    );
  });

  it("throws when todo is not found", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(null);
    await expect(removeTodo("bad-id", "user-123")).rejects.toThrow("Todo not found");
  });
});