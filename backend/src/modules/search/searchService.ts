import { Request, Response } from "express";
import * as SearchRepository from "./searchRepository";
import { findSongIdsByLyrics, SongWithLyrics } from "../../utils/lyricsSearch";

export const search = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string" || q.trim() === "") {
    res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
    return;
  }

  const results = await SearchRepository.searchAll(q.trim());

  // บันทึก search history ถ้า login อยู่
  if (req.user) {
    await SearchRepository.createSearchHistory({
      userId: req.user.id,
      query: q.trim(),
    });
  }

  res.json({ success: true, data: results });
};

export const getSearchHistory = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const history = await SearchRepository.findSearchHistoryByUser(userId);
  res.json({ success: true, data: history });
};

export const clearSearchHistory = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await SearchRepository.clearSearchHistory(userId);
  res.json({ success: true, message: "Search history cleared" });
};

// ─── SearchHistoryItem handlers ───────────────────────────────────────────────

export const getSearchHistoryItems = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const items = await SearchRepository.findSearchHistoryItemsByUser(userId);
  res.json({ success: true, data: items });
};

export const addSearchHistoryItem = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { itemId, itemType, title, subtitle, coverUrl } = req.body;
  if (!itemId || !itemType || !title || !subtitle) {
    res.status(400).json({ success: false, message: "itemId, itemType, title, subtitle are required" });
    return;
  }
  const item = await SearchRepository.upsertSearchHistoryItem({ userId, itemId, itemType, title, subtitle, coverUrl });
  res.status(201).json({ success: true, data: item });
};

export const removeSearchHistoryItem = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  await SearchRepository.deleteSearchHistoryItem(userId, id);
  res.json({ success: true, message: "Item removed" });
};

export const clearSearchHistoryItems = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await SearchRepository.clearSearchHistoryItems(userId);
  res.json({ success: true, message: "Search history cleared" });
};

// ─── AI lyrics search ─────────────────────────────────────────────────────────

export const lyricsSearch = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string" || q.trim() === "") {
    res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
    return;
  }

  // ดึงเพลงที่มี lyrics จาก DB
  const songsWithLyrics = await SearchRepository.getSongsWithLyrics();

  if (songsWithLyrics.length === 0) {
    res.json({ success: true, data: { songs: [], artists: [], albums: [] }, aiUsed: true });
    return;
  }

  // ให้ Claude เปรียบเทียบ query กับเนื้อเพลงใน DB
  const mapped: SongWithLyrics[] = songsWithLyrics.map((s) => ({
    id: s.id,
    title: s.title,
    artistName: s.artist.name,
    lyrics: s.lyrics!,
  }));

  const matchedIds = await findSongIdsByLyrics(mapped, q.trim());

  if (matchedIds.length === 0) {
    res.json({ success: true, data: { songs: [], artists: [], albums: [] }, aiUsed: true });
    return;
  }

  const songs = await SearchRepository.getSongsByIds(matchedIds);

  res.json({
    success: true,
    data: { songs, artists: [], albums: [] },
    aiUsed: true,
  });
};
