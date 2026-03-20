import { prisma } from "../../lib/prisma";
import { SearchHistoryCreateInput } from "./searchModel";

export const searchAll = async (query: string) => {
  const [songs, artists, albums] = await Promise.all([
    prisma.song.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      include: { artist: true, album: true, genre: true },
      take: 10,
    }),
    prisma.artist.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 10,
    }),
    prisma.album.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      include: { artist: true },
      take: 10,
    }),
  ]);

  return { songs, artists, albums };
};

export const findSongsByLyrics = async (query: string) => {
  return prisma.song.findMany({
    where: {
      lyrics: { contains: query, mode: "insensitive" },
    },
    include: { artist: true, album: true, genre: true },
    take: 10,
  });
};

export const findSearchHistoryByUser = async (userId: string) => {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { searchedAt: "desc" },
    take: 20,
  });
};

export const createSearchHistory = async (data: SearchHistoryCreateInput) => {
  return prisma.searchHistory.create({ data });
};

export const clearSearchHistory = async (userId: string) => {
  return prisma.searchHistory.deleteMany({ where: { userId } });
};