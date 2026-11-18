import { Request, Response } from "express";
import * as PlayHistoryRepository from "./playHistoryRepository";

export const getPlayHistory = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const history = await PlayHistoryRepository.findPlayHistory(userId, limit);
  res.json({ success: true, data: history });
};

export const deleteAllHistory = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await PlayHistoryRepository.deleteAllHistory(userId);
  res.json({ success: true, message: "All history deleted" });
};

export const deleteHistoryRecord = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const record = await PlayHistoryRepository.findHistoryRecord(id, userId);
  if (!record) {
    res.status(404).json({ success: false, message: "Record not found" });
    return;
  }

  await PlayHistoryRepository.deleteHistoryRecord(id);
  res.json({ success: true, message: "Deleted" });
};

export const recordPlay = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { songId } = req.body;

  if (!songId) {
    res.status(400).json({ success: false, message: "songId is required" });
    return;
  }

  const record = await PlayHistoryRepository.recordPlay(userId, songId as string);
  res.status(201).json({ success: true, data: record });
};
