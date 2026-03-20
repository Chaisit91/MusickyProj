import { prisma } from "../../lib/prisma";
import { PlaylistCreateInput, PlaylistUpdateInput } from "./playlistModel";

const playlistInclude = {
  playlistSongs: {
    include: {
      song: {
        include: { artist: true, album: true, genre: true },
      },
    },
    orderBy: { position: "asc" as const },
  },
};

export const findPlaylistsByUser = async (userId: string) => {
  return prisma.playlist.findMany({
    where: { userId },
    include: playlistInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const findPlaylistById = async (id: string) => {
  return prisma.playlist.findUnique({
    where: { id },
    include: playlistInclude,
  });
};

export const createPlaylist = async (data: PlaylistCreateInput) => {
  return prisma.playlist.create({
    data,
    include: playlistInclude,
  });
};

export const updatePlaylist = async (id: string, data: PlaylistUpdateInput) => {
  return prisma.playlist.update({
    where: { id },
    data,
    include: playlistInclude,
  });
};

export const deletePlaylist = async (id: string) => {
  return prisma.playlist.delete({ where: { id } });
};

export const findPlaylistSong = async (playlistId: string, songId: string) => {
  return prisma.playlistSong.findUnique({
    where: { playlistId_songId: { playlistId, songId } },
  });
};

export const getNextPosition = async (playlistId: string) => {
  const last = await prisma.playlistSong.findFirst({
    where: { playlistId },
    orderBy: { position: "desc" },
  });
  return last ? last.position + 1 : 1;
};

export const addSongToPlaylist = async (playlistId: string, songId: string, position: number) => {
  return prisma.playlistSong.create({
    data: { playlistId, songId, position },
    include: {
      song: { include: { artist: true, album: true, genre: true } },
    },
  });
};

export const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
  return prisma.playlistSong.delete({
    where: { playlistId_songId: { playlistId, songId } },
  });
};
