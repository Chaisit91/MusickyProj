import { prisma } from "../../lib/prisma";
import { ArtistFollowCreateInput } from "./artistFollowModel";

export const findFollowedArtistsByUser = async (userId: string) => {
  return prisma.artistFollow.findMany({
    where: { userId },
    include: { artist: true },
    orderBy: { createdAt: "desc" },
  });
};

export const findArtistFollow = async (userId: string, artistId: string) => {
  return prisma.artistFollow.findUnique({
    where: { userId_artistId: { userId, artistId } },
  });
};

export const createArtistFollow = async (data: ArtistFollowCreateInput) => {
  return prisma.artistFollow.create({
    data,
    include: { artist: true },
  });
};

export const deleteArtistFollow = async (userId: string, artistId: string) => {
  return prisma.artistFollow.delete({
    where: { userId_artistId: { userId, artistId } },
  });
};
