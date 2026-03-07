import { PrismaClient } from "@/generated/client";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import prisma from "@/config/prisma";

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;