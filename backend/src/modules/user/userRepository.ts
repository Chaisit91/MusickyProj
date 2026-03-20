import { prisma } from "../../lib/prisma";

export const findAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      isActive: true, createdAt: true, lastLogin: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true,
      isActive: true, createdAt: true, lastLogin: true,
    },
  });
};

export const banUser = async (id: string) => {
  return prisma.user.update({ where: { id }, data: { isActive: false } });
};

export const unbanUser = async (id: string) => {
  return prisma.user.update({ where: { id }, data: { isActive: true } });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};
