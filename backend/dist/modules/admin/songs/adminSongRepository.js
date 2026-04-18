"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementPlayCount = exports.deleteSong = exports.updateSong = exports.createSong = exports.findSongById = exports.findAllSongs = exports.getSongStats = void 0;
const prisma_1 = require("../../../lib/prisma");
const getSongStats = async () => {
    var _a, _b;
    const [totalSongs, totalPlaysAgg, avgPlaysAgg] = await Promise.all([
        prisma_1.prisma.song.count(),
        prisma_1.prisma.song.aggregate({ _sum: { playCount: true } }),
        prisma_1.prisma.song.aggregate({ _avg: { playCount: true } }),
    ]);
    return {
        totalSongs,
        totalPlays: (_a = totalPlaysAgg._sum.playCount) !== null && _a !== void 0 ? _a : 0,
        avgPlays: Math.round((_b = avgPlaysAgg._avg.playCount) !== null && _b !== void 0 ? _b : 0),
    };
};
exports.getSongStats = getSongStats;
const findAllSongs = async (search, genreId, artistId) => {
    return prisma_1.prisma.song.findMany({
        where: {
            ...(search && { title: { contains: search, mode: "insensitive" } }),
            ...(genreId && { genreId }),
            ...(artistId && { artistId }),
        },
        include: { artist: true, album: true, genre: true },
        orderBy: { playCount: "desc" },
    });
};
exports.findAllSongs = findAllSongs;
const findSongById = async (id) => {
    return prisma_1.prisma.song.findUnique({
        where: { id },
        include: { artist: true, album: true, genre: true },
    });
};
exports.findSongById = findSongById;
const createSong = async (data) => {
    return prisma_1.prisma.song.create({
        data,
        include: { artist: true, album: true, genre: true },
    });
};
exports.createSong = createSong;
const updateSong = async (id, data) => {
    return prisma_1.prisma.song.update({
        where: { id },
        data,
        include: { artist: true, album: true, genre: true },
    });
};
exports.updateSong = updateSong;
const deleteSong = async (id) => {
    return prisma_1.prisma.$transaction([
        prisma_1.prisma.likedSong.deleteMany({ where: { songId: id } }),
        prisma_1.prisma.playlistSong.deleteMany({ where: { songId: id } }),
        prisma_1.prisma.download.deleteMany({ where: { songId: id } }),
        prisma_1.prisma.queue.deleteMany({ where: { songId: id } }),
        prisma_1.prisma.song.delete({ where: { id } }),
    ]);
};
exports.deleteSong = deleteSong;
const incrementPlayCount = async (id) => {
    return prisma_1.prisma.song.update({
        where: { id },
        data: { playCount: { increment: 1 } },
    });
};
exports.incrementPlayCount = incrementPlayCount;
//# sourceMappingURL=adminSongRepository.js.map