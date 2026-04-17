import { prisma } from "../../../lib/prisma";
import { Role } from "@prisma/client";

export const findAllUsers = async (search?: string, status?: string) => {
  const now = new Date();
  return prisma.user.findMany({
    where: {
      AND: [
        ...(search ? [{ OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ]}] : []),
        ...(status === "active"   ? [{ isActive: true }] : []),
        ...(status === "banned"   ? [{ isActive: false }] : []),
        ...(status === "premium"  ? [{ isPremium: true, premiumExpiresAt: { gt: now } }] : []),
        ...(status === "free"     ? [{ OR: [{ isPremium: false }, { premiumExpiresAt: { lte: now } }] }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isPremium: true,
      premiumExpiresAt: true,
      createdAt: true,
      lastLogin: true,
      _count: {
        select: { playlists: true, likedSongs: true, downloads: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      _count: {
        select: { playlists: true, likedSongs: true, downloads: true },
      },
    },
  });
};

export const updateUser = async (id: string, data: {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: Role;
}) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });
};

export const banUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
};

export const unbanUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { isActive: true },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};

export const getPremiumStats = async () => {
  const now = new Date();
  const [total, premium, banned] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { isPremium: true, premiumExpiresAt: { gt: now } },
    }),
    prisma.user.count({ where: { isActive: false } }),
  ]);
  return { total, premium, active: total - banned, banned, free: total - premium };
};
