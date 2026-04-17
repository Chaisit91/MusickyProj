"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSong = exports.updateSong = exports.createSong = exports.findSongById = exports.findAllSongs = exports.findTrendingSongs = void 0;
const prisma_1 = require("../../lib/prisma");
const songInclude = {
    artist: true,
    album: true,
    genre: true,
};
const findTrendingSongs = async (limit = 10) => {
    // นับจำนวนครั้งที่ถูกเล่นจาก PlayHistory ของทุก user แล้วเรียงมากไปน้อย
    const counts = await prisma_1.prisma.playHistory.groupBy({
        by: ["songId"],
        _count: { songId: true },
        orderBy: { _count: { songId: "desc" } },
        take: limit,
    });
    if (counts.length === 0) {
        // ถ้าไม่มี play history เลย ให้ fallback เป็นเพลงใหม่สุด
        return prisma_1.prisma.song.findMany({
            take: limit,
            include: songInclude,
            orderBy: { createdAt: "desc" },
        });
    }
    const songIds = counts.map((c) => c.songId);
    const songs = await prisma_1.prisma.song.findMany({
        where: { id: { in: songIds } },
        include: songInclude,
    });
    // เรียงตามลำดับที่ได้จาก groupBy
    return songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean);
};
exports.findTrendingSongs = findTrendingSongs;
const findAllSongs = async (filter = {}) => {
    const { artistId, albumId, genreId, search, languages } = filter;
    return prisma_1.prisma.song.findMany({
        where: {
            ...(artistId && { artistId }),
            ...(albumId && { albumId }),
            ...(genreId && { genreId }),
            ...(search && {
                title: { contains: search, mode: "insensitive" },
            }),
            ...(languages && languages.length > 0 && {
                language: { in: languages },
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