import { prismaMock } from "../../mocks/prisma";
import { getUserProfile } from "@/services/user.service";

const today = new Date();
today.setHours(0, 0, 0, 0);

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  password: "hashed",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  todos: [],
};

describe("getUserProfile", () => {
  it("returns profile with zero stats when user has no todos", async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await getUserProfile("user-123");

    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
    expect(result.stats.total).toBe(0);
    expect(result.stats.completed).toBe(0);
    expect(result.stats.completionRate).toBe(0);
    expect(result.stats.streak).toBe(0);
    expect(result.heatmap).toEqual({});
  });

  it("throws when user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(getUserProfile("bad-id")).rejects.toThrow("User not found");
  });

  it("computes completion rate correctly", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      todos: [
        { completed: true, completedAt: today },
        { completed: true, completedAt: today },
        { completed: false, completedAt: null },
        { completed: false, completedAt: null },
      ],
    } as any);

    const result = await getUserProfile("user-123");

    expect(result.stats.total).toBe(4);
    expect(result.stats.completed).toBe(2);
    expect(result.stats.completionRate).toBe(50);
  });

  it("builds heatmap from completedAt dates", async () => {
    const dateKey = today.toISOString().slice(0, 10);
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      todos: [
        { completed: true, completedAt: today },
        { completed: true, completedAt: today },
      ],
    } as any);

    const result = await getUserProfile("user-123");

    expect(result.heatmap[dateKey]).toBe(2);
  });

  it("calculates streak for consecutive days ending today", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      todos: [
        { completed: true, completedAt: today },
        { completed: true, completedAt: yesterday },
        { completed: true, completedAt: twoDaysAgo },
      ],
    } as any);

    const result = await getUserProfile("user-123");

    expect(result.stats.streak).toBe(3);
  });

  it("calculates streak ending yesterday if nothing completed today", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      todos: [
        { completed: true, completedAt: yesterday },
        { completed: true, completedAt: twoDaysAgo },
      ],
    } as any);

    const result = await getUserProfile("user-123");

    expect(result.stats.streak).toBe(2);
  });

  it("returns streak of 0 when no recent completions", async () => {
    const oldDate = new Date(today);
    oldDate.setDate(today.getDate() - 5);

    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      todos: [{ completed: true, completedAt: oldDate }],
    } as any);

    const result = await getUserProfile("user-123");

    expect(result.stats.streak).toBe(0);
  });

  it("ignores todos without completedAt in heatmap", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser,
      todos: [{ completed: true, completedAt: null }],
    } as any);

    const result = await getUserProfile("user-123");

    expect(Object.keys(result.heatmap)).toHaveLength(0);
  });
});