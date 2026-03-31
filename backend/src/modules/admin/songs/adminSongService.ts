import { Request, Response } from "express";
import * as AdminSongRepository from "./adminSongRepository";
import {
  uploadImageToCloudinary,
  uploadAudioToCloudinary,
  deleteImageFromCloudinary,
  deleteAudioFromCloudinary,
} from "../../../utils/uploadImage";

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
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const { title, artistId, albumId, genreId, filePath: filePathBody, duration, year, lyrics } = req.body;

  if (!title || !artistId || !albumId || !genreId) {
    res.status(400).json({
      success: false,
      message: "title, artistId, albumId, genreId are required",
    });
    return;
  }

  // --- กำหนด audio source + auto-detect duration ---
  let filePath: string;
  let autoDuration: number | undefined;

  if (files?.audioFile?.[0]) {
    const buf = files.audioFile[0].buffer;
    try {
      const { parseBuffer } = await import("music-metadata");
      const meta = await parseBuffer(buf, { mimeType: "audio/mpeg" });
      if (meta.format.duration) autoDuration = Math.round(meta.format.duration);
    } catch { /* fallback to manual */ }
    filePath = await uploadAudioToCloudinary(buf);
  } else if (filePathBody) {
    filePath = filePathBody;
  } else {
    res.status(400).json({
      success: false,
      message: "audioFile (MP3) or filePath is required",
    });
    return;
  }

  // --- อัปโหลดรูปปก (ถ้ามี) ---
  let coverUrl: string | undefined;
  if (files?.coverImage?.[0]) {
    coverUrl = await uploadImageToCloudinary(files.coverImage[0].buffer, "songs");
  }

  const song = await AdminSongRepository.createSong({
    title,
    artistId,
    albumId,
    genreId,
    filePath,
    coverUrl,
    duration: autoDuration ?? (duration ? Number(duration) : undefined),
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

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const { title, artistId, albumId, genreId, filePath: filePathBody, duration, year, lyrics, deleteCover } = req.body;

  // --- อัปเดต audio source + auto-detect duration ถ้ามีการส่งมาใหม่ ---
  let filePath: string | undefined;
  let autoDuration: number | undefined;

  if (files?.audioFile?.[0]) {
    const buf = files.audioFile[0].buffer;
    if (existing.filePath?.includes("cloudinary.com")) {
      await deleteAudioFromCloudinary(existing.filePath);
    }
    try {
      const { parseBuffer } = await import("music-metadata");
      const meta = await parseBuffer(buf, { mimeType: "audio/mpeg" });
      if (meta.format.duration) autoDuration = Math.round(meta.format.duration);
    } catch { /* fallback */ }
    filePath = await uploadAudioToCloudinary(buf);
  } else if (filePathBody) {
    filePath = filePathBody;
  }

  // --- อัปเดตรูปปก / ลบรูปปก ---
  let coverUrl: string | undefined | null;
  if (deleteCover === "true") {
    if ((existing as any).coverUrl) {
      await deleteImageFromCloudinary((existing as any).coverUrl).catch(() => {});
    }
    coverUrl = null; // clear in DB
  } else if (files?.coverImage?.[0]) {
    if ((existing as any).coverUrl) {
      await deleteImageFromCloudinary((existing as any).coverUrl).catch(() => {});
    }
    coverUrl = await uploadImageToCloudinary(files.coverImage[0].buffer, "songs");
  }

  const song = await AdminSongRepository.updateSong(id, {
    ...(title && { title }),
    ...(artistId && { artistId }),
    ...(albumId && { albumId }),
    ...(genreId && { genreId }),
    ...(filePath && { filePath }),
    ...(coverUrl !== undefined && { coverUrl: coverUrl ?? undefined }),
    ...(deleteCover === "true" && { coverUrl: null }),
    ...(autoDuration !== undefined ? { duration: autoDuration } : duration !== undefined ? { duration: Number(duration) } : {}),
    ...(year && { year: Number(year) }),
    ...(lyrics !== undefined && { lyrics }),
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

  if (existing.filePath?.includes("cloudinary.com")) {
    await deleteAudioFromCloudinary(existing.filePath);
  }
  if ((existing as any).coverUrl?.includes("cloudinary.com")) {
    await deleteImageFromCloudinary((existing as any).coverUrl);
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
