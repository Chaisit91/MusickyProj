import { prisma } from "../../lib/prisma";
import { SongCreateInput, SongUpdateInput, SongFilterInput } from "./songModel";

const songInclude = {
  artist: true,
  album: true,
  genre: true,
};

export const findTrendingSongs = async (limit = 10) => {
  // นับจำนวนครั้งที่ถูกเล่นจาก PlayHistory ของทุก user แล้วเรียงมากไปน้อย
  const counts = await prisma.playHistory.groupBy({
    by: ["songId"],
    _count: { songId: true },
    orderBy: { _count: { songId: "desc" } },
    take: limit,
  });

  if (counts.length === 0) {
    // ถ้าไม่มี play history เลย ให้ fallback เป็นเพลงใหม่สุด
    return prisma.song.findMany({
      take: limit,
      include: songInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  const songIds = counts.map((c) => c.songId);
  const songs = await prisma.song.findMany({
    where: { id: { in: songIds } },
    include: songInclude,
  });

  // เรียงตามลำดับที่ได้จาก groupBy
  return songIds
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean) as typeof songs;
};

export const findAllSongs = async (filter: SongFilterInput = {}) => {
  const { artistId, albumId, genreId, search } = filter;
  return prisma.song.findMany({
    where: {
      ...(artistId && { artistId }),
      ...(albumId && { albumId }),
      ...(genreId && { genreId }),
      ...(search && {
        title: { contains: search, mode: "insensitive" },
      }),
    },
    include: songInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const findSongById = async (id: string) => {
  return prisma.song.findUnique({
    where: { id },
    include: songInclude,
  });
};

export const createSong = async (data: SongCreateInput) => {
  return prisma.song.create({
    data,
    include: songInclude,
  });
};

export const updateSong = async (id: string, data: SongUpdateInput) => {
  return prisma.song.update({
    where: { id },
    data,
    include: songInclude,
  });
};

export const deleteSong = async (id: string) => {
  return prisma.song.delete({ where: { id } });
};
