import request from "supertest";
import app from "@/app";
import "../../mocks/prisma";
import { prismaMock } from "../../mocks/prisma";
import jwt from "jsonwebtoken";

const mockTodo = {
  id: "todo-123",
  title: "Test todo",
  completed: false,
  dueDate: null,
  userId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeToken = (userId = "user-123") =>
  jwt.sign({ userId, email: "test@example.com" }, process.env.JWT_SECRET!, { expiresIn: "15m" });

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

describe("GET /api/todos", () => {
  it("returns todos for the authenticated user", async () => {
    prismaMock.todo.findMany.mockResolvedValue([mockTodo]);

    const res = await request(app)
      .get("/api/todos")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe("todo-123");
  });

  it("returns empty array when user has no todos", async () => {
    prismaMock.todo.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/todos")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(401);
  });

  it("returns 403 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/todos")
      .set({ Authorization: "Bearer badtoken" });

    expect(res.status).toBe(403);
  });
});

describe("POST /api/todos", () => {
  it("creates and returns a todo", async () => {
    prismaMock.todo.create.mockResolvedValue(mockTodo);

    const res = await request(app)
      .post("/api/todos")
      .set(authHeader(makeToken()))
      .send({ title: "Test todo" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Test todo");
  });

  it("creates a todo with a due date", async () => {
    const withDue = { ...mockTodo, dueDate: new Date("2025-12-31") };
    prismaMock.todo.create.mockResolvedValue(withDue);

    const res = await request(app)
      .post("/api/todos")
      .set(authHeader(makeToken()))
      .send({ title: "Test todo", dueDate: "2025-12-31" });

    expect(res.status).toBe(201);
    expect(res.body.dueDate).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set(authHeader(makeToken()))
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when title is empty string", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set(authHeader(makeToken()))
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/todos").send({ title: "Test" });
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/todos/:id", () => {
  it("updates and returns the todo", async () => {
    const updated = { ...mockTodo, title: "Updated title" };
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    prismaMock.todo.update.mockResolvedValue(updated);

    const res = await request(app)
      .put("/api/todos/todo-123")
      .set(authHeader(makeToken()))
      .send({ title: "Updated title" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated title");
  });

  it("toggles completed status", async () => {
    const updated = { ...mockTodo, completed: true };
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    prismaMock.todo.update.mockResolvedValue(updated);

    const res = await request(app)
      .put("/api/todos/todo-123")
      .set(authHeader(makeToken()))
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("returns 404 when todo does not exist", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/todos/bad-id")
      .set(authHeader(makeToken()))
      .send({ title: "x" });

    expect(res.status).toBe(404);
  });

  it("returns 400 when title is updated to empty string", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);

    const res = await request(app)
      .put("/api/todos/todo-123")
      .set(authHeader(makeToken()))
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app)
      .put("/api/todos/todo-123")
      .send({ title: "x" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("deletes the todo and returns 204", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(mockTodo);
    prismaMock.todo.delete.mockResolvedValue(mockTodo);

    const res = await request(app)
      .delete("/api/todos/todo-123")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(204);
  });

  it("returns 404 when todo does not exist", async () => {
    prismaMock.todo.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/todos/bad-id")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(404);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).delete("/api/todos/todo-123");
    expect(res.status).toBe(401);
  });
});