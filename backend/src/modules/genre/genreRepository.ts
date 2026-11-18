import { prisma } from "../../lib/prisma";
import { GenreCreateInput, GenreUpdateInput } from "./genreModel";

export const findAllGenres = async () => {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
  });
};

export const findGenreById = async (id: string) => {
  return prisma.genre.findUnique({
    where: { id },
    include: { songs: true },
  });
};

export const findGenreByName = async (name: string) => {
  return prisma.genre.findUnique({ where: { name } });
};

export const createGenre = async (data: GenreCreateInput) => {
  return prisma.genre.create({ data });
};

export const updateGenre = async (id: string, data: GenreUpdateInput) => {
  return prisma.genre.update({ where: { id }, data });
};

export const deleteGenre = async (id: string) => {
  return prisma.genre.delete({ where: { id } });
};
