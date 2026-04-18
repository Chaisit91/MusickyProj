"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPlay = exports.deleteAllHistory = exports.deleteHistoryRecord = exports.findHistoryRecord = exports.findPlayHistory = void 0;
const prisma_1 = require("../../lib/prisma");
const songInclude = {
    artist: true,
    album: true,
    genre: true,
};
const findPlayHistory = async (userId, limit) => {
    return prisma_1.prisma.playHistory.findMany({
        where: { userId },
        include: { song: { include: songInclude } },
        orderBy: { playedAt: "desc" },
        ...(limit ? { take: limit } : {}),
    });
};
exports.findPlayHistory = findPlayHistory;
const findHistoryRecord = async (id, userId) => {
    return prisma_1.prisma.playHistory.findFirst({ where: { id, userId } });
};
exports.findHistoryRecord = findHistoryRecord;
const deleteHistoryRecord = async (id) => {
    return prisma_1.prisma.playHistory.delete({ where: { id } });
};
exports.deleteHistoryRecord = deleteHistoryRecord;
const deleteAllHistory = async (userId) => {
    return prisma_1.prisma.playHistory.deleteMany({ where: { userId } });
};
exports.deleteAllHistory = deleteAllHistory;
const recordPlay = async (userId, songId) => {
    const [existing] = await Promise.all([
        prisma_1.prisma.playHistory.findFirst({ where: { userId, songId } }),
        prisma_1.prisma.song.update({
            where: { id: songId },
            data: { playCount: { increment: 1 } },
        }),
        prisma_1.prisma.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() },
        }),
    ]);
    if (existing) {
        return prisma_1.prisma.playHistory.update({
            where: { id: existing.id },
            data: { playedAt: new Date() },
            include: { song: { include: songInclude } },
        });
    }
    return prisma_1.prisma.playHistory.create({
        data: { userId, songId },
        include: { song: { include: songInclude } },
    });
};
exports.recordPlay = recordPlay;
//# sourceMappingURL=playHistoryRepository.js.map