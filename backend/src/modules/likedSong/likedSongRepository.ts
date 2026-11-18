import { prisma } from "../../lib/prisma";
import { LikedSongCreateInput } from "./likedSongModel";

export const findLikedSongsByUser = async (userId: string) => {
  return prisma.likedSong.findMany({
    where: { userId },
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findLikedSong = async (userId: string, songId: string) => {
  return prisma.likedSong.findUnique({
    where: { userId_songId: { userId, songId } },
  });
};

export const createLikedSong = async (data: LikedSongCreateInput) => {
  return prisma.likedSong.create({
    data,
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
  });
};

export const deleteLikedSong = async (userId: string, songId: string) => {
  return prisma.likedSong.delete({
    where: { userId_songId: { userId, songId } },
  });
};
