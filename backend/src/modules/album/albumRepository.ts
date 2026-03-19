import { prisma } from "../../lib/prisma";
import { AlbumCreateInput, AlbumUpdateInput } from "./albumModel";

export const findAllAlbums = async () => {
  return prisma.album.findMany({
    include: { artist: true },
    orderBy: { releaseDate: "desc" },
  });
};

export const findAlbumById = async (id: string) => {
  return prisma.album.findUnique({
    where: { id },
    include: {
      artist: true,
      songs: {
        include: { genre: true },
      },
    },
  });
};

export const findAlbumsByArtist = async (artistId: string) => {
  return prisma.album.findMany({
    where: { artistId },
    include: { artist: true },
    orderBy: { releaseDate: "desc" },
  });
};

export const createAlbum = async (data: AlbumCreateInput) => {
  return prisma.album.create({
    data: {
      ...data,
      releaseDate: new Date(data.releaseDate),
    },
    include: { artist: true },
  });
};

export const updateAlbum = async (id: string, data: AlbumUpdateInput) => {
  return prisma.album.update({
    where: { id },
    data: {
      ...data,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
    },
    include: { artist: true },
  });
};

export const deleteAlbum = async (id: string) => {
  return prisma.album.delete({ where: { id } });
};
