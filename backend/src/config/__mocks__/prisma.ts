import { PrismaClient } from "../../generated/client";
import { mockDeep } from "jest-mock-extended";

const prisma = mockDeep<PrismaClient>();
export default prisma;