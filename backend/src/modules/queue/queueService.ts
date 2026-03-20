import { Request, Response } from "express";
import * as QueueRepository from "./queueRepository";

export const getQueue = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const queue = await QueueRepository.findQueueByUser(userId);
  res.json({ success: true, data: queue });
};

export const addToQueue = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { songId } = req.body;

  if (!songId) {
    res.status(400).json({ success: false, message: "songId is required" });
    return;
  }

  const position = await QueueRepository.getNextQueuePosition(userId);
  const item = await QueueRepository.addToQueue({ userId, songId }, position);
  res.status(201).json({ success: true, data: item });
};

export const removeFromQueue = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  const item = await QueueRepository.findQueueItemById(id);
  if (!item) {
    res.status(404).json({ success: false, message: "Queue item not found" });
    return;
  }
  if (item.userId !== userId) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  await QueueRepository.removeFromQueue(id);
  res.json({ success: true, message: "Removed from queue" });
};

export const clearQueue = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await QueueRepository.clearQueue(userId);
  res.json({ success: true, message: "Queue cleared" });
};

export const reorderQueue = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    res.status(400).json({ success: false, message: "orderedIds must be a non-empty array" });
    return;
  }

  // ตรวจสอบว่า ids ทั้งหมดเป็นของ user นี้
  const queue = await QueueRepository.findQueueByUser(userId);
  const userQueueIds = queue.map((q) => q.id);
  const allOwned = orderedIds.every((id) => userQueueIds.includes(id));

  if (!allOwned) {
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  await QueueRepository.reorderQueue(userId, orderedIds);
  const updated = await QueueRepository.findQueueByUser(userId);
  res.json({ success: true, data: updated });
};
