import "../../mocks/prisma";
import { prismaMock } from "../../mocks/prisma";
import bcrypt from "bcrypt";
import { registerUser, loginUser } from "@/services/auth.service";

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  password: "hashedpassword",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("registerUser", () => {
  it("creates a user and returns tokens", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser);

    const result = await registerUser("test@example.com", "Test User", "Password1!");

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("throws when email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      registerUser("test@example.com", "Test", "Password1!")
    ).rejects.toThrow();
  });

  it("hashes the password before storing", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser);

    await registerUser("test@example.com", "Test User", "Password1!");

    const createCall = prismaMock.user.create.mock.calls[0]?.[0];
    expect(createCall?.data.password).not.toBe("Password1!");
  });
});

describe("loginUser", () => {
  it("returns tokens on valid credentials", async () => {
    const hashed = await bcrypt.hash("Password1!", 10);
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

    const result = await loginUser("test@example.com", "Password1!");

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("throws on wrong password", async () => {
    const hashed = await bcrypt.hash("correctpassword", 10);
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

    await expect(
      loginUser("test@example.com", "wrongpassword")
    ).rejects.toThrow();
  });

  it("throws when user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser("nobody@example.com", "Password1!")
    ).rejects.toThrow();
  });
});