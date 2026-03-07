// Reusable Prisma mock — import this in any test that touches the DB
import { PrismaClient } from "@/generated/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

jest.mock("@/config/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

import prisma from "../../src/config/prisma";

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;