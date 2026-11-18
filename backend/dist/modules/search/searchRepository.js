"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.createSearchHistory = exports.findSearchHistoryByUser = exports.searchAll = void 0;
const prisma_1 = require("../../lib/prisma");
const searchAll = async (query) => {
    const [songs, artists, albums] = await Promise.all([
        prisma_1.prisma.song.findMany({
            where: { title: { contains: query, mode: "insensitive" } },
            include: { artist: true, album: true, genre: true },
            take: 10,
        }),
        prisma_1.prisma.artist.findMany({
            where: { name: { contains: query, mode: "insensitive" } },
            take: 10,
        }),
        prisma_1.prisma.album.findMany({
            where: { title: { contains: query, mode: "insensitive" } },
            include: { artist: true },
            take: 10,
        }),
    ]);
    return { songs, artists, albums };
};
exports.searchAll = searchAll;
const findSearchHistoryByUser = async (userId) => {
    return prisma_1.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { searchedAt: "desc" },
        take: 20,
    });
};
exports.findSearchHistoryByUser = findSearchHistoryByUser;
const createSearchHistory = async (data) => {
    return prisma_1.prisma.searchHistory.create({ data });
};
exports.createSearchHistory = createSearchHistory;
const clearSearchHistory = async (userId) => {
    return prisma_1.prisma.searchHistory.deleteMany({ where: { userId } });
};
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchRepository.js.map