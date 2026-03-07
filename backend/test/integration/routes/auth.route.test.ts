import request from "supertest";
import app from "@/app";
import "../../mocks/prisma";
import { prismaMock } from "../../mocks/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  password: "hashedpassword",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("POST /api/auth/register", () => {
  it("returns 201 and accessToken on success", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser);

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      name: "Test User",
      password: "Password1!",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("sets a refreshToken httpOnly cookie on success", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser);

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      name: "Test User",
      password: "Password1!",
    });

    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/refreshToken/);
  });

  it("returns 409 when email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      name: "Test User",
      password: "Password1!",
    });

    expect(res.status).toBe(409);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "test@example.com" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 200 and accessToken on valid credentials", async () => {
    const hashed = await bcrypt.hash("Password1!", 10);
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("sets a refreshToken cookie on valid login", async () => {
    const hashed = await bcrypt.hash("Password1!", 10);
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password1!",
    });

    expect(res.headers["set-cookie"][0]).toMatch(/refreshToken/);
  });

  it("returns 401 on wrong password", async () => {
    const hashed = await bcrypt.hash("correctpassword", 10);
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh", () => {
  it("returns a new accessToken with valid refresh cookie", async () => {
    const token = jwt.sign({ userId: "user-123" }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [`refreshToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("returns 401 with no cookie", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });

  it("returns 403 with an invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshToken=badtoken"]);

    expect(res.status).toBe(403);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears the refresh cookie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"][0]).toMatch(/refreshToken=;|refreshToken=(?:;|$)/);
  });
});