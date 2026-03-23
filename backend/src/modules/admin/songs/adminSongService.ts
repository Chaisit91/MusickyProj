import { Request, Response } from "express";
import * as AdminSongRepository from "./adminSongRepository";

export const getSongStats = async (req: Request, res: Response) => {
  const stats = await AdminSongRepository.getSongStats();
  res.json({ success: true, data: stats });
};

export const getAllSongs = async (req: Request, res: Response) => {
  const { search, genreId } = req.query;
  const songs = await AdminSongRepository.findAllSongs(
    search as string,
    genreId as string
  );
  res.json({ success: true, data: songs });
};

export const getSongById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const song = await AdminSongRepository.findSongById(id);
  if (!song) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  res.json({ success: true, data: song });
};

export const createSong = async (req: Request, res: Response) => {
  const { title, artistId, albumId, genreId, filePath, duration, year, lyrics } = req.body;
  if (!title || !artistId || !albumId || !genreId || !filePath) {
    res.status(400).json({
      success: false,
      message: "title, artistId, albumId, genreId and filePath are required",
    });
    return;
  }
  const song = await AdminSongRepository.createSong({
    title, artistId, albumId, genreId, filePath,
    duration: duration ? Number(duration) : undefined,
    year: year ? Number(year) : undefined,
    lyrics,
  });
  res.status(201).json({ success: true, data: song });
};

export const updateSong = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminSongRepository.findSongById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  const { title, artistId, albumId, genreId, filePath, duration, year, lyrics } = req.body;
  const song = await AdminSongRepository.updateSong(id, {
    title, artistId, albumId, genreId, filePath,
    duration: duration ? Number(duration) : undefined,
    year: year ? Number(year) : undefined,
    lyrics,
  });
  res.json({ success: true, data: song });
};

export const deleteSong = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminSongRepository.findSongById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  await AdminSongRepository.deleteSong(id);
  res.json({ success: true, message: "Song deleted" });
};

export const playSong = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminSongRepository.findSongById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  await AdminSongRepository.incrementPlayCount(id);
  res.json({ success: true, message: "Play count updated" });
};