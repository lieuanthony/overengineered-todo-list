import request from "supertest";
import app from "@/app";
import { prismaMock } from "../../mocks/prisma";
import jwt from "jsonwebtoken";

const makeToken = (userId = "user-123") =>
  jwt.sign({ userId, email: "test@example.com" }, process.env.JWT_SECRET!, { expiresIn: "15m" });

const mockUserWithTodos = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  password: "hashed",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  todos: [],
};

describe("GET /api/users/me", () => {
  it("returns the authenticated user's profile", async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUserWithTodos as any);

    const res = await request(app)
      .get("/api/users/me")
      .set({ Authorization: `Bearer ${makeToken()}` });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Test User");
    expect(res.body.email).toBe("test@example.com");
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("heatmap");
  });

  it("returns correct stats with completed todos", async () => {
    const today = new Date();
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUserWithTodos,
      todos: [
        { completed: true, completedAt: today },
        { completed: false, completedAt: null },
      ],
    } as any);

    const res = await request(app)
      .get("/api/users/me")
      .set({ Authorization: `Bearer ${makeToken()}` });

    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(2);
    expect(res.body.stats.completed).toBe(1);
    expect(res.body.stats.completionRate).toBe(50);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("returns 403 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set({ Authorization: "Bearer badtoken" });

    expect(res.status).toBe(403);
  });

  it("returns 404 when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/users/me")
      .set({ Authorization: `Bearer ${makeToken()}` });

    expect(res.status).toBe(404);
  });
});