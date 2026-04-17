"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllDownloadsByUser = exports.deleteDownloadBySongId = exports.deleteDownload = exports.createDownload = exports.findDownload = exports.findDownloadsByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const findDownloadsByUser = async (userId) => {
    return prisma_1.prisma.download.findMany({
        where: { userId },
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
        orderBy: { downloadedAt: "desc" },
    });
};
exports.findDownloadsByUser = findDownloadsByUser;
const findDownload = async (userId, songId) => {
    return prisma_1.prisma.download.findFirst({
        where: { userId, songId },
    });
};
exports.findDownload = findDownload;
const createDownload = async (data) => {
    return prisma_1.prisma.download.create({
        data,
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
    });
};
exports.createDownload = createDownload;
const deleteDownload = async (id) => {
    return prisma_1.prisma.download.delete({ where: { id } });
};
exports.deleteDownload = deleteDownload;
const deleteDownloadBySongId = async (userId, songId) => {
    return prisma_1.prisma.download.deleteMany({ where: { userId, songId } });
};
exports.deleteDownloadBySongId = deleteDownloadBySongId;
const deleteAllDownloadsByUser = async (userId) => {
    return prisma_1.prisma.download.deleteMany({ where: { userId } });
};
exports.deleteAllDownloadsByUser = deleteAllDownloadsByUser;
//# sourceMappingURL=downloadRepository.js.map