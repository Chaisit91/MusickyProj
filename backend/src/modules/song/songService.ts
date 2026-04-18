import { Request, Response } from "express";
import * as SongRepository from "./songRepository";
import { fetchLyricsFromLRCLIB } from "../../utils/lrclib";

export const getTrendingSongs = async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const songs = await SongRepository.findTrendingSongs(limit);
  res.json({ success: true, data: songs });
};

export const getAllSongs = async (req: Request, res: Response) => {
  const { artistId, albumId, genreId, search } = req.query;
  const songs = await SongRepository.findAllSongs({
    artistId: artistId as string,
    albumId: albumId as string,
    genreId: genreId as string,
    search: search as string,
  });
  res.json({ success: true, data: songs });
};

export const getSongById = async (req: Request, res: Response) => {
  const song = await SongRepository.findSongById(req.params.id as string);
  if (!song) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  res.json({ success: true, data: song });
};

export const createSong = async (req: Request, res: Response) => {
  const { title, artistId, albumId, genreId, filePath } = req.body;
  if (!title || !artistId || !albumId || !genreId || !filePath) {
    res.status(400).json({ success: false, message: "title, artistId, albumId, genreId and filePath are required" });
    return;
  }
  const song = await SongRepository.createSong({ title, artistId, albumId, genreId, filePath });
  res.status(201).json({ success: true, data: song });
};

export const updateSong = async (req: Request, res: Response) => {
  const existing = await SongRepository.findSongById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  const { title, artistId, albumId, genreId, filePath } = req.body;
  const song = await SongRepository.updateSong(req.params.id as string, { title, artistId, albumId, genreId, filePath });
  res.json({ success: true, data: song });
};

export const getSongLyrics = async (req: Request, res: Response) => {
  const song = await SongRepository.findSongById(req.params.id as string);
  if (!song) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }

  // Return cached lyrics from DB
  if (song.lyrics) {
    res.json({ success: true, data: { lyrics: song.lyrics, source: "db" } });
    return;
  }

  // Fetch from LRCLIB
  const lyrics = await fetchLyricsFromLRCLIB(
    song.title,
    song.artist?.name ?? "",
    song.album?.title ?? "",
    song.duration ?? 0
  );

  if (lyrics) {
    // Save to DB for next time
    await SongRepository.updateSong(song.id, { lyrics });
    res.json({ success: true, data: { lyrics, source: "lrclib" } });
    return;
  }

  res.json({ success: true, data: { lyrics: null, source: null } });
};

export const deleteSong = async (req: Request, res: Response) => {
  const existing = await SongRepository.findSongById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Song not found" });
    return;
  }
  await SongRepository.deleteSong(req.params.id as string);
  res.json({ success: true, message: "Song deleted" });
};
