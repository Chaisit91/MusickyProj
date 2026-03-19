import { prisma } from "../../lib/prisma";
import { ArtistCreateInput, ArtistUpdateInput } from "./artistModel";

export const findAllArtists = async () => {
  return prisma.artist.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const findArtistById = async (id: string) => {
  return prisma.artist.findUnique({
    where: { id },
    include: {
      albums: true,
      songs: {
        include: {
          album: true,
          genre: true,
        },
      },
    },
  });
};

export const createArtist = async (data: ArtistCreateInput) => {
  return prisma.artist.create({ data });
};

export const updateArtist = async (id: string, data: ArtistUpdateInput) => {
  return prisma.artist.update({ where: { id }, data });
};

export const deleteArtist = async (id: string) => {
  return prisma.artist.delete({ where: { id } });
};
