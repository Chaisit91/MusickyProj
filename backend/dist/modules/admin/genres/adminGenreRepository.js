"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGenre = exports.updateGenre = exports.createGenre = exports.findGenreById = exports.findAllGenres = exports.getGenreStats = void 0;
const prisma_1 = require("../../../lib/prisma");
const getGenreStats = async () => {
    const [totalGenres, totalSongs] = await Promise.all([
        prisma_1.prisma.genre.count(),
        prisma_1.prisma.song.count(),
    ]);
    const avgSongsPerGenre = totalGenres > 0 ? Math.round(totalSongs / totalGenres) : 0;
    return { totalGenres, totalSongs, avgSongsPerGenre };
};
exports.getGenreStats = getGenreStats;
const findAllGenres = async () => {
    return prisma_1.prisma.genre.findMany({
        include: { _count: { select: { songs: true } } },
        orderBy: { name: "asc" },
    });
};
exports.findAllGenres = findAllGenres;
const findGenreById = async (id) => {
    return prisma_1.prisma.genre.findUnique({
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
exports.findGenreById = findGenreById;
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
//# sourceMappingURL=adminGenreRepository.js.map