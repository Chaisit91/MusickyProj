import { Request, Response } from "express";
import * as DownloadRepository from "./downloadRepository";

export const getDownloads = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const downloads = await DownloadRepository.findDownloadsByUser(userId);
  res.json({ success: true, data: downloads });
};

export const addDownload = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { songId } = req.body;

  if (!songId) {
    res.status(400).json({ success: false, message: "songId is required" });
    return;
  }

  // อนุญาตให้ download เพลงเดิมซ้ำได้ (บันทึกทุกครั้ง)
  const download = await DownloadRepository.createDownload({ userId, songId });
  res.status(201).json({ success: true, data: download });
};

export const removeDownload = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;

  // ตรวจสอบว่า download นี้เป็นของ user นี้จริง
  const downloads = await DownloadRepository.findDownloadsByUser(userId);
  const owned = downloads.find((d) => d.id === id);

  if (!owned) {
    res.status(404).json({ success: false, message: "Download not found" });
    return;
  }

  await DownloadRepository.deleteDownload(id);
  res.json({ success: true, message: "Download removed" });
};

export const clearAllDownloads = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await DownloadRepository.deleteAllDownloadsByUser(userId);
  res.json({ success: true, message: "All downloads cleared" });
};
