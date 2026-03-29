import { prisma } from "../../lib/prisma";

const songInclude = {
  artist: true,
  album: true,
  genre: true,
};

export const findPlayHistory = async (userId: string, limit?: number) => {
  return prisma.playHistory.findMany({
    where: { userId },
    include: { song: { include: songInclude } },
    orderBy: { playedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
};

export const findHistoryRecord = async (id: string, userId: string) => {
  return prisma.playHistory.findFirst({ where: { id, userId } });
};

export const deleteHistoryRecord = async (id: string) => {
  return prisma.playHistory.delete({ where: { id } });
};

export const deleteAllHistory = async (userId: string) => {
  return prisma.playHistory.deleteMany({ where: { userId } });
};

export const recordPlay = async (userId: string, songId: string) => {
  const existing = await prisma.playHistory.findFirst({
    where: { userId, songId },
  });

  if (existing) {
    return prisma.playHistory.update({
      where: { id: existing.id },
      data: { playedAt: new Date() },
      include: { song: { include: songInclude } },
    });
  }

  return prisma.playHistory.create({
    data: { userId, songId },
    include: { song: { include: songInclude } },
  });
};
