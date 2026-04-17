"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArtistFollow = exports.createArtistFollow = exports.findArtistFollow = exports.findFollowedArtistsByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const findFollowedArtistsByUser = async (userId) => {
    return prisma_1.prisma.artistFollow.findMany({
        where: { userId },
        include: { artist: true },
        orderBy: { createdAt: "desc" },
    });
};
exports.findFollowedArtistsByUser = findFollowedArtistsByUser;
const findArtistFollow = async (userId, artistId) => {
    return prisma_1.prisma.artistFollow.findUnique({
        where: { userId_artistId: { userId, artistId } },
    });
};
exports.findArtistFollow = findArtistFollow;
const createArtistFollow = async (data) => {
    return prisma_1.prisma.artistFollow.create({
        data,
        include: { artist: true },
    });
};
exports.createArtistFollow = createArtistFollow;
const deleteArtistFollow = async (userId, artistId) => {
    return prisma_1.prisma.artistFollow.delete({
        where: { userId_artistId: { userId, artistId } },
    });
};
exports.deleteArtistFollow = deleteArtistFollow;
//# sourceMappingURL=artistFollowRepository.js.map