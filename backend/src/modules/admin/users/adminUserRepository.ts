import { prisma } from "../../../lib/prisma";

export const findAllUsers = async (search?: string, status?: string) => {
  return prisma.user.findMany({
    where: {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status === "active" && { isActive: true }),
      ...(status === "banned" && { isActive: false }),
    },
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
