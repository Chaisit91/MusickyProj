import { Request, Response } from "express";
import * as LikedSongRepository from "./likedSongRepository";

export const getLikedSongs = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const likedSongs = await LikedSongRepository.findLikedSongsByUser(userId);
  res.json({ success: true, data: likedSongs });
};

export const likeSong = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { songId } = req.body;

  if (!songId) {
    res.status(400).json({ success: false, message: "songId is required" });
    return;
  }

  const existing = await LikedSongRepository.findLikedSong(userId, songId);
  if (existing) {
    res.status(409).json({ success: false, message: "Song already liked" });
    return;
  }

  const likedSong = await LikedSongRepository.createLikedSong({ userId, songId });
  res.status(201).json({ success: true, data: likedSong });
};

export const unlikeSong = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const songId = req.params.songId as string;

  const existing = await LikedSongRepository.findLikedSong(userId, songId);
  if (!existing) {
    res.status(404).json({ success: false, message: "Liked song not found" });
    return;
  }

  await LikedSongRepository.deleteLikedSong(userId, songId);
  res.json({ success: true, message: "Song unliked" });
};
