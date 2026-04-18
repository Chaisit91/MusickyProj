"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAlbum = exports.updateAlbum = exports.createAlbum = exports.findAlbumsByArtist = exports.findAlbumById = exports.findAllAlbums = void 0;
const prisma_1 = require("../../lib/prisma");
const findAllAlbums = async () => {
    return prisma_1.prisma.album.findMany({
        include: { artist: true },
        orderBy: { releaseDate: "desc" },
    });
};
exports.findAllAlbums = findAllAlbums;
const findAlbumById = async (id) => {
    return prisma_1.prisma.album.findUnique({
        where: { id },
        include: {
            artist: true,
            songs: {
                include: { genre: true },
            },
        },
    });
};
exports.findAlbumById = findAlbumById;
const findAlbumsByArtist = async (artistId) => {
    return prisma_1.prisma.album.findMany({
        where: { artistId },
        include: { artist: true },
        orderBy: { releaseDate: "desc" },
    });
};
exports.findAlbumsByArtist = findAlbumsByArtist;
const createAlbum = async (data) => {
    return prisma_1.prisma.album.create({
        data: {
            title: data.title,
            artistId: data.artistId,
            releaseDate: new Date(data.releaseDate),
            ...(data.coverUrl && { coverUrl: data.coverUrl }),
        },
        include: { artist: true },
    });
};
exports.createAlbum = createAlbum;
const updateAlbum = async (id, data) => {
    return prisma_1.prisma.album.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.artistId && { artistId: data.artistId }),
            ...(data.releaseDate && { releaseDate: new Date(data.releaseDate) }),
            ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        },
        include: { artist: true },
    });
};
exports.updateAlbum = updateAlbum;
const deleteAlbum = async (id) => {
    return prisma_1.prisma.album.delete({ where: { id } });
};
exports.deleteAlbum = deleteAlbum;
//# sourceMappingURL=albumRepository.js.map