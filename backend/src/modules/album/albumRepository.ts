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
      title: data.title,
      artistId: data.artistId,
      releaseDate: new Date(data.releaseDate),
      ...(data.coverUrl && { coverUrl: data.coverUrl }),
    },
    include: { artist: true },
  });
};

export const updateAlbum = async (id: string, data: AlbumUpdateInput) => {
  return prisma.album.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.artistId && { artistId: data.artistId }),
      ...(data.releaseDate && { releaseDate: new Date(data.releaseDate) }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
    },
    include: { artist: true },
  });
};

export const deleteAlbum = async (id: string) => {
  return prisma.album.delete({ where: { id } });
};
