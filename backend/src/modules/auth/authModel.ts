import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User model สำหรับเข้าถึงข้อมูล User
export const User = prisma.user;