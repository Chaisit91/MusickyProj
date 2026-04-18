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

export const findUserByGoogleId = async (googleId: string) => {
  return prisma.user.findUnique({ where: { googleId } });
};

export const createGoogleUser = async (data: {
  name: string;
  email: string;
  googleId: string;
  avatarUrl?: string;
}) => {
  // สร้าง random password สำหรับ Google user (ไม่ได้ใช้ login ด้วย email)
  const randomPass = Math.random().toString(36) + Math.random().toString(36);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: randomPass,
      googleId: data.googleId,
      avatarUrl: data.avatarUrl,
    },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, googleId: true },
  });
};

export const linkGoogleId = async (userId: string, googleId: string, avatarUrl?: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { googleId, ...(avatarUrl ? { avatarUrl } : {}) },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
  });
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; avatarUrl?: string }
) => {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, isPremium: true, premiumExpiresAt: true },
  });
};

// ── RefreshToken table ─────────────────────────────────────────

export const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return prisma.refreshToken.upsert({
    where: { token },
    update: { userId, expiresAt },
    create: { userId, token, expiresAt },
  });
};

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const deleteRefreshToken = async (token: string) => {
  return prisma.refreshToken.deleteMany({ where: { token } });
};

export const deleteAllRefreshTokensByUser = async (userId: string) => {
  return prisma.refreshToken.deleteMany({ where: { userId } });
};

export const deleteExpiredTokens = async () => {
  return prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};
