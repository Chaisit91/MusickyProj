import { prisma } from "../../lib/prisma";
import { DownloadCreateInput } from "./downloadModel";

export const findDownloadsByUser = async (userId: string) => {
  return prisma.download.findMany({
    where: { userId },
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
    orderBy: { downloadedAt: "desc" },
  });
};

export const findDownload = async (userId: string, songId: string) => {
  return prisma.download.findFirst({
    where: { userId, songId },
  });
};

export const createDownload = async (data: DownloadCreateInput) => {
  return prisma.download.create({
    data,
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
  });
};

export const deleteDownload = async (id: string) => {
  return prisma.download.delete({ where: { id } });
};

export const deleteAllDownloadsByUser = async (userId: string) => {
  return prisma.download.deleteMany({ where: { userId } });
};
