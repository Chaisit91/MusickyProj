"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSongsByIds = exports.getSongsWithLyrics = exports.clearSearchHistoryItems = exports.deleteSearchHistoryItem = exports.upsertSearchHistoryItem = exports.findSearchHistoryItemsByUser = exports.clearSearchHistory = exports.createSearchHistory = exports.findSearchHistoryByUser = exports.searchAll = void 0;
const prisma_1 = require("../../lib/prisma");
const searchAll = async (query) => {
    const [songsByTitle, songsByArtist, artists, albums] = await Promise.all([
        prisma_1.prisma.song.findMany({
            where: { title: { contains: query, mode: "insensitive" } },
            include: { artist: true, album: true, genre: true },
            take: 30,
        }),
        prisma_1.prisma.song.findMany({
            where: { artist: { name: { contains: query, mode: "insensitive" } } },
            include: { artist: true, album: true, genre: true },
            take: 30,
        }),
        prisma_1.prisma.artist.findMany({
            where: { name: { contains: query, mode: "insensitive" } },
            take: 20,
        }),
        prisma_1.prisma.album.findMany({
            where: { title: { contains: query, mode: "insensitive" } },
            include: { artist: true },
            take: 10,
        }),
    ]);
    // Merge & deduplicate songs
    const seen = new Set();
    const songs = [...songsByTitle, ...songsByArtist].filter((s) => {
        if (seen.has(s.id))
            return false;
        seen.add(s.id);
        return true;
    });
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
// ─── SearchHistoryItem (rich items) ──────────────────────────────────────────
const findSearchHistoryItemsByUser = async (userId) => {
    return prisma_1.prisma.searchHistoryItem.findMany({
        where: { userId },
        orderBy: { searchedAt: "desc" },
        take: 20,
    });
};
exports.findSearchHistoryItemsByUser = findSearchHistoryItemsByUser;
const upsertSearchHistoryItem = async (data) => {
    return prisma_1.prisma.searchHistoryItem.upsert({
        where: { userId_itemId: { userId: data.userId, itemId: data.itemId } },
        update: { searchedAt: new Date(), title: data.title, subtitle: data.subtitle, coverUrl: data.coverUrl },
        create: data,
    });
};
exports.upsertSearchHistoryItem = upsertSearchHistoryItem;
const deleteSearchHistoryItem = async (userId, id) => {
    return prisma_1.prisma.searchHistoryItem.deleteMany({ where: { id, userId } });
};
exports.deleteSearchHistoryItem = deleteSearchHistoryItem;
const clearSearchHistoryItems = async (userId) => {
    return prisma_1.prisma.searchHistoryItem.deleteMany({ where: { userId } });
};
exports.clearSearchHistoryItems = clearSearchHistoryItems;
// ─── ดึงเพลงที่มี lyrics สำหรับ AI lyrics search ─────────────────────────────
const getSongsWithLyrics = async () => {
    return prisma_1.prisma.song.findMany({
        where: { lyrics: { not: null } },
        select: {
            id: true,
            title: true,
            lyrics: true,
            artist: { select: { name: true } },
        },
        take: 200,
    });
};
exports.getSongsWithLyrics = getSongsWithLyrics;
const getSongsByIds = async (ids) => {
    return prisma_1.prisma.song.findMany({
        where: { id: { in: ids } },
        include: { artist: true, album: true, genre: true },
    });
};
exports.getSongsByIds = getSongsByIds;
//# sourceMappingURL=searchRepository.js.map