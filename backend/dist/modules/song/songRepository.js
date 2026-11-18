"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSong = exports.updateSong = exports.createSong = exports.findSongById = exports.findAllSongs = void 0;
const prisma_1 = require("../../lib/prisma");
const songInclude = {
    artist: true,
    album: true,
    genre: true,
};
const findAllSongs = async (filter = {}) => {
    const { artistId, albumId, genreId, search } = filter;
    return prisma_1.prisma.song.findMany({
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
exports.findAllSongs = findAllSongs;
const findSongById = async (id) => {
    return prisma_1.prisma.song.findUnique({
        where: { id },
        include: songInclude,
    });
};
exports.findSongById = findSongById;
const createSong = async (data) => {
    return prisma_1.prisma.song.create({
        data,
        include: songInclude,
    });
};
exports.createSong = createSong;
const updateSong = async (id, data) => {
    return prisma_1.prisma.song.update({
        where: { id },
        data,
        include: songInclude,
    });
};
exports.updateSong = updateSong;
const deleteSong = async (id) => {
    return prisma_1.prisma.song.delete({ where: { id } });
};
exports.deleteSong = deleteSong;
//# sourceMappingURL=songRepository.js.map