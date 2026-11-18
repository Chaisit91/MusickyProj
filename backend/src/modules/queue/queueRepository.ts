import { prisma } from "../../lib/prisma";
import { QueueAddInput } from "./queueModel";

export const findQueueByUser = async (userId: string) => {
  return prisma.queue.findMany({
    where: { userId },
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
    orderBy: { position: "asc" },
  });
};

export const findQueueItemById = async (id: string) => {
  return prisma.queue.findUnique({ where: { id } });
};

export const getNextQueuePosition = async (userId: string) => {
  const last = await prisma.queue.findFirst({
    where: { userId },
    orderBy: { position: "desc" },
  });
  return last ? last.position + 1 : 1;
};

export const addToQueue = async (data: QueueAddInput, position: number) => {
  return prisma.queue.create({
    data: { ...data, position },
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
  });
};

export const removeFromQueue = async (id: string) => {
  return prisma.queue.delete({ where: { id } });
};

export const clearQueue = async (userId: string) => {
  return prisma.queue.deleteMany({ where: { userId } });
};

export const reorderQueue = async (userId: string, orderedIds: string[]) => {
  // อัปเดต position ทีละ item ตามลำดับใหม่
  const updates = orderedIds.map((id, index) =>
    prisma.queue.update({
      where: { id },
      data: { position: index + 1 },
    })
  );
  return prisma.$transaction(updates);
};
