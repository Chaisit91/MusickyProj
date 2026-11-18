"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGenre = exports.updateGenre = exports.createGenre = exports.findGenreByName = exports.findGenreById = exports.findAllGenres = void 0;
const prisma_1 = require("../../lib/prisma");
const findAllGenres = async () => {
    return prisma_1.prisma.genre.findMany({
        orderBy: { name: "asc" },
    });
};
exports.findAllGenres = findAllGenres;
const findGenreById = async (id) => {
    return prisma_1.prisma.genre.findUnique({
        where: { id },
        include: { songs: true },
    });
};
exports.findGenreById = findGenreById;
const findGenreByName = async (name) => {
    return prisma_1.prisma.genre.findUnique({ where: { name } });
};
exports.findGenreByName = findGenreByName;
const createGenre = async (data) => {
    return prisma_1.prisma.genre.create({ data });
};
exports.createGenre = createGenre;
const updateGenre = async (id, data) => {
    return prisma_1.prisma.genre.update({ where: { id }, data });
};
exports.updateGenre = updateGenre;
const deleteGenre = async (id) => {
    return prisma_1.prisma.genre.delete({ where: { id } });
};
exports.deleteGenre = deleteGenre;
//# sourceMappingURL=genreRepository.js.map