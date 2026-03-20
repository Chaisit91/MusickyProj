import { prisma } from "../../lib/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  birthDate?: Date;
}) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateLastLogin = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
  });
};

// ── RefreshToken table ─────────────────────────────────────────

export const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // หมดอายุใน 7 วัน
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deleteRefreshToken = async (token: string) => {
  return prisma.refreshToken.delete({ where: { token } });
};

export const deleteAllRefreshTokensByUser = async (userId: string) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};

export const deleteExpiredTokens = async () => {
  return prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};
