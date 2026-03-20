"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArtist = exports.updateArtist = exports.createArtist = exports.findArtistById = exports.findAllArtists = void 0;
const prisma_1 = require("../../lib/prisma");
const findAllArtists = async () => {
    return prisma_1.prisma.artist.findMany({
        orderBy: { createdAt: "desc" },
    });
};
exports.findAllArtists = findAllArtists;
const findArtistById = async (id) => {
    return prisma_1.prisma.artist.findUnique({
        where: { id },
        include: {
            albums: true,
            songs: {
                include: {
                    album: true,
                    genre: true,
                },
            },
        },
    });
};
exports.findArtistById = findArtistById;
const createArtist = async (data) => {
    return prisma_1.prisma.artist.create({ data });
};
exports.createArtist = createArtist;
const updateArtist = async (id, data) => {
    return prisma_1.prisma.artist.update({ where: { id }, data });
};
exports.updateArtist = updateArtist;
const deleteArtist = async (id) => {
    return prisma_1.prisma.artist.delete({ where: { id } });
};
exports.deleteArtist = deleteArtist;
//# sourceMappingURL=artistRepository.js.map