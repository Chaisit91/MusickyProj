import { Request, Response } from "express";
import * as SearchRepository from "./searchRepository";

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
