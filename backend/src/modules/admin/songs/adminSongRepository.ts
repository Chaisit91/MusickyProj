import { prisma } from "../../../lib/prisma";

export const getSongStats = async () => {
  const [totalSongs, totalPlaysAgg, avgPlaysAgg] = await Promise.all([
    prisma.song.count(),
    prisma.song.aggregate({ _sum: { playCount: true } }),
    prisma.song.aggregate({ _avg: { playCount: true } }),
  ]);
  return {
    totalSongs,
    totalPlays: totalPlaysAgg._sum.playCount ?? 0,
    avgPlays: Math.round(avgPlaysAgg._avg.playCount ?? 0),
  };
};

export const findAllSongs = async (search?: string, genreId?: string, artistId?: string) => {
  return prisma.song.findMany({
    where: {
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...(genreId && { genreId }),
      ...(artistId && { artistId }),
    },
    include: { artist: true, album: true, genre: true },
    orderBy: { playCount: "desc" },
  });
};

export const findSongById = async (id: string) => {
  return prisma.song.findUnique({
    where: { id },
    include: { artist: true, album: true, genre: true },
  });
};

export const createSong = async (data: {
  title: string;
  artistId: string;
  albumId: string;
  genreId: string;
  filePath: string;
  coverUrl?: string;
  duration?: number;
  year?: number;
  lyrics?: string;
}) => {
  return prisma.song.create({
    data,
    include: { artist: true, album: true, genre: true },
  });
};

export const updateSong = async (id: string, data: {
  title?: string;
  artistId?: string;
  albumId?: string;
  genreId?: string;
  filePath?: string;
  coverUrl?: string | null;
  duration?: number;
  year?: number;
  lyrics?: string;
}) => {
  return prisma.song.update({
    where: { id },
    data,
    include: { artist: true, album: true, genre: true },
  });
};

export const deleteSong = async (id: string) => {
  return prisma.$transaction([
    prisma.likedSong.deleteMany({ where: { songId: id } }),
    prisma.playlistSong.deleteMany({ where: { songId: id } }),
    prisma.download.deleteMany({ where: { songId: id } }),
    prisma.song.delete({ where: { id } }),
  ]);
};

export const incrementPlayCount = async (id: string) => {
  return prisma.song.update({
    where: { id },
    data: { playCount: { increment: 1 } },
  });
};