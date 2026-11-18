"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLikedSong = exports.createLikedSong = exports.findLikedSong = exports.findLikedSongsByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const findLikedSongsByUser = async (userId) => {
    return prisma_1.prisma.likedSong.findMany({
        where: { userId },
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.findLikedSongsByUser = findLikedSongsByUser;
const findLikedSong = async (userId, songId) => {
    return prisma_1.prisma.likedSong.findUnique({
        where: { userId_songId: { userId, songId } },
    });
};
exports.findLikedSong = findLikedSong;
const createLikedSong = async (data) => {
    return prisma_1.prisma.likedSong.create({
        data,
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
    });
};
exports.createLikedSong = createLikedSong;
const deleteLikedSong = async (userId, songId) => {
    return prisma_1.prisma.likedSong.delete({
        where: { userId_songId: { userId, songId } },
    });
};
exports.deleteLikedSong = deleteLikedSong;
//# sourceMappingURL=likedSongRepository.js.map