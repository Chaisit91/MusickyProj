import { prisma } from "../../lib/prisma";
import { SongCreateInput, SongUpdateInput, SongFilterInput } from "./songModel";

const songInclude = {
  artist: true,
  album: true,
  genre: true,
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
