import { Response } from "express";
import { MulterRequest } from "../../../types/multerRequest";
import * as AdminGenreRepository from "./adminGenreRepository";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../../utils/uploadImage";

export const getGenreStats = async (req: MulterRequest, res: Response) => {
  const stats = await AdminGenreRepository.getGenreStats();
  res.json({ success: true, data: stats });
};

export const getAllGenres = async (req: MulterRequest, res: Response) => {
  const genres = await AdminGenreRepository.findAllGenres();
  res.json({ success: true, data: genres });
};

export const getGenreById = async (req: MulterRequest, res: Response) => {
  const id = req.params.id as string;
  const genre = await AdminGenreRepository.findGenreById(id);
  if (!genre) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  res.json({ success: true, data: genre });
};

export const createGenre = async (req: MulterRequest, res: Response) => {
  const { name, description, color, imageUrl: imageUrlFromBody } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }

  let imageUrl: string | undefined = imageUrlFromBody;
  if (req.file) {
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "genres");
  }

  const genre = await AdminGenreRepository.createGenre({ name, description, color, imageUrl });
  res.status(201).json({ success: true, data: genre });
};

export const updateGenre = async (req: MulterRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminGenreRepository.findGenreById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }

  const { name, description, color, imageUrl: imageUrlFromBody, removeImage } = req.body;

  let imageUrl: string | null | undefined = undefined;

  if (req.file) {
    // ✅ มีไฟล์ใหม่ → ลบเก่า + upload ใหม่
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "genres");
  } else if (removeImage === "true" || removeImage === true) {
    // ✅ กดลบรูป → ลบออกจาก Cloudinary + set null ใน DB
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = null;
  } else if (imageUrlFromBody && imageUrlFromBody !== existing.imageUrl) {
    imageUrl = imageUrlFromBody;
  }

  const genre = await AdminGenreRepository.updateGenre(id, {
    name,
    description,
    color,
    // ✅ ถ้า imageUrl เป็น null → set null ใน DB (ลบรูป)
    // ถ้าเป็น undefined → ไม่เปลี่ยนแปลง
    ...(imageUrl !== undefined && { imageUrl }),
  });
  res.json({ success: true, data: genre });
};

export const deleteGenre = async (req: MulterRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminGenreRepository.findGenreById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
  await AdminGenreRepository.deleteGenre(id);
  res.json({ success: true, message: "Genre deleted" });
};