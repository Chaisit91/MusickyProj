import { Request, Response } from "express";
import * as PlaylistRepository from "./playlistRepository";

export const getPlaylists = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const playlists = await PlaylistRepository.findPlaylistsByUser(userId);
  res.json({ success: true, data: playlists });
};

export const getPlaylistById = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const playlist = await PlaylistRepository.findPlaylistById(req.params.id as string);

  if (!playlist) {
    res.status(404).json({ success: false, message: "Playlist not found" });
    return;
  }
  if (playlist.userId !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  res.json({ success: true, data: playlist });
};

export const createPlaylist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }

  const playlist = await PlaylistRepository.createPlaylist({ name, userId });
  res.status(201).json({ success: true, data: playlist });
};

export const updatePlaylist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const playlist = await PlaylistRepository.findPlaylistById(req.params.id as string);

  if (!playlist) {
    res.status(404).json({ success: false, message: "Playlist not found" });
    return;
  }
  if (playlist.userId !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  const { name } = req.body;
  const updated = await PlaylistRepository.updatePlaylist(req.params.id as string, { name });
  res.json({ success: true, data: updated });
};

export const deletePlaylist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const playlist = await PlaylistRepository.findPlaylistById(req.params.id as string);

  if (!playlist) {
    res.status(404).json({ success: false, message: "Playlist not found" });
    return;
  }
  if (playlist.userId !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  await PlaylistRepository.deletePlaylist(req.params.id as string);
  res.json({ success: true, message: "Playlist deleted" });
};

export const addSong = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const playlistId = req.params.id as string;
  const { songId } = req.body;

  if (!songId) {
    res.status(400).json({ success: false, message: "songId is required" });
    return;
  }

  const playlist = await PlaylistRepository.findPlaylistById(playlistId);
  if (!playlist) {
    res.status(404).json({ success: false, message: "Playlist not found" });
    return;
  }
  if (playlist.userId !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  const existing = await PlaylistRepository.findPlaylistSong(playlistId, songId);
  if (existing) {
    res.status(409).json({ success: false, message: "Song already in playlist" });
    return;
  }

  const position = await PlaylistRepository.getNextPosition(playlistId);
  const playlistSong = await PlaylistRepository.addSongToPlaylist(playlistId, songId, position);
  res.status(201).json({ success: true, data: playlistSong });
};

export const removeSong = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const playlistId = req.params.id as string;
  const songId = req.params.songId as string;

  const playlist = await PlaylistRepository.findPlaylistById(playlistId);
  if (!playlist) {
    res.status(404).json({ success: false, message: "Playlist not found" });
    return;
  }
  if (playlist.userId !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  const existing = await PlaylistRepository.findPlaylistSong(playlistId, songId);
  if (!existing) {
    res.status(404).json({ success: false, message: "Song not found in playlist" });
    return;
  }

  await PlaylistRepository.removeSongFromPlaylist(playlistId, songId);
  res.json({ success: true, message: "Song removed from playlist" });
};
