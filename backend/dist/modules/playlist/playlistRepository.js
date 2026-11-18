"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSongFromPlaylist = exports.addSongToPlaylist = exports.getNextPosition = exports.findPlaylistSong = exports.deletePlaylist = exports.updatePlaylist = exports.createPlaylist = exports.findPlaylistById = exports.findPlaylistsByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const playlistInclude = {
    playlistSongs: {
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
        orderBy: { position: "asc" },
    },
};
const findPlaylistsByUser = async (userId) => {
    return prisma_1.prisma.playlist.findMany({
        where: { userId },
        include: playlistInclude,
        orderBy: { createdAt: "desc" },
    });
};
exports.findPlaylistsByUser = findPlaylistsByUser;
const findPlaylistById = async (id) => {
    return prisma_1.prisma.playlist.findUnique({
        where: { id },
        include: playlistInclude,
    });
};
exports.findPlaylistById = findPlaylistById;
const createPlaylist = async (data) => {
    return prisma_1.prisma.playlist.create({
        data,
        include: playlistInclude,
    });
};
exports.createPlaylist = createPlaylist;
const updatePlaylist = async (id, data) => {
    return prisma_1.prisma.playlist.update({
        where: { id },
        data,
        include: playlistInclude,
    });
};
exports.updatePlaylist = updatePlaylist;
const deletePlaylist = async (id) => {
    return prisma_1.prisma.playlist.delete({ where: { id } });
};
exports.deletePlaylist = deletePlaylist;
const findPlaylistSong = async (playlistId, songId) => {
    return prisma_1.prisma.playlistSong.findUnique({
        where: { playlistId_songId: { playlistId, songId } },
    });
};
exports.findPlaylistSong = findPlaylistSong;
const getNextPosition = async (playlistId) => {
    const last = await prisma_1.prisma.playlistSong.findFirst({
        where: { playlistId },
        orderBy: { position: "desc" },
    });
    return last ? last.position + 1 : 1;
};
exports.getNextPosition = getNextPosition;
const addSongToPlaylist = async (playlistId, songId, position) => {
    return prisma_1.prisma.playlistSong.create({
        data: { playlistId, songId, position },
        include: {
            song: { include: { artist: true, album: true, genre: true } },
        },
    });
};
exports.addSongToPlaylist = addSongToPlaylist;
const removeSongFromPlaylist = async (playlistId, songId) => {
    return prisma_1.prisma.playlistSong.delete({
        where: { playlistId_songId: { playlistId, songId } },
    });
};
exports.removeSongFromPlaylist = removeSongFromPlaylist;
//# sourceMappingURL=playlistRepository.js.map