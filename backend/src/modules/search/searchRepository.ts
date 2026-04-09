import { prisma } from "../../lib/prisma";
import { SearchHistoryCreateInput, SearchHistoryItemCreateInput } from "./searchModel";

export const searchAll = async (query: string) => {
  const [songsByTitle, songsByArtist, artists, albums] = await Promise.all([
    prisma.song.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      include: { artist: true, album: true, genre: true },
      take: 30,
    }),
    prisma.song.findMany({
      where: { artist: { name: { contains: query, mode: "insensitive" } } },
      include: { artist: true, album: true, genre: true },
      take: 30,
    }),
    prisma.artist.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 20,
    }),
    prisma.album.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      include: { artist: true },
      take: 10,
    }),
  ]);

  // Merge & deduplicate songs
  const seen = new Set<string>();
  const songs = [...songsByTitle, ...songsByArtist].filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  return { songs, artists, albums };
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

// ─── SearchHistoryItem (rich items) ──────────────────────────────────────────

export const findSearchHistoryItemsByUser = async (userId: string) => {
  return prisma.searchHistoryItem.findMany({
    where: { userId },
    orderBy: { searchedAt: "desc" },
    take: 20,
  });
};

export const upsertSearchHistoryItem = async (data: SearchHistoryItemCreateInput) => {
  return prisma.searchHistoryItem.upsert({
    where: { userId_itemId: { userId: data.userId, itemId: data.itemId } },
    update: { searchedAt: new Date(), title: data.title, subtitle: data.subtitle, coverUrl: data.coverUrl },
    create: data,
  });
};

export const deleteSearchHistoryItem = async (userId: string, id: string) => {
  return prisma.searchHistoryItem.deleteMany({ where: { id, userId } });
};

export const clearSearchHistoryItems = async (userId: string) => {
  return prisma.searchHistoryItem.deleteMany({ where: { userId } });
};
