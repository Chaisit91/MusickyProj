import { prisma } from "../../../lib/prisma";

export const getGenreStats = async () => {
  const [totalGenres, totalSongs] = await Promise.all([
    prisma.genre.count(),
    prisma.song.count(),
  ]);
  const avgSongsPerGenre = totalGenres > 0 ? Math.round(totalSongs / totalGenres) : 0;
  return { totalGenres, totalSongs, avgSongsPerGenre };
};

export const findAllGenres = async () => {
  return prisma.genre.findMany({
    include: { _count: { select: { songs: true } } },
    orderBy: { name: "asc" },
  });
};

export const findGenreById = async (id: string) => {
  return prisma.genre.findUnique({
    where: { id },
    include: {
      _count: { select: { songs: true } },
      songs: {
        include: { artist: true },
        take: 10,
      },
    },
  });
};

export const createGenre = async (data: {
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}) => {
  return prisma.genre.create({ data });
};

export const updateGenre = async (id: string, data: {
  name?: string;
  description?: string;
  imageUrl?: string | null; // ✅ รับ null ได้ — ใช้ตอนลบรูป
  color?: string;
}) => {
  return prisma.genre.update({ where: { id }, data });
};

export const deleteGenre = async (id: string) => {
  return prisma.genre.delete({ where: { id } });
};