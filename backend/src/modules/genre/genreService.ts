import { Response } from "express";
import { MulterRequest } from "../../types/multerRequest";
import * as GenreRepository from "./genreRepository";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../utils/uploadImage";

export const getAllGenres = async (req: MulterRequest, res: Response) => {
  const genres = await GenreRepository.findAllGenres();
  res.json({ success: true, data: genres });
};

export const getGenreById = async (req: MulterRequest, res: Response) => {
  const genre = await GenreRepository.findGenreById(req.params.id as string);
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

  const existing = await GenreRepository.findGenreByName(name);
  if (existing) {
    res.status(409).json({ success: false, message: "Genre already exists" });
    return;
  }

  let imageUrl: string | undefined = imageUrlFromBody;
  if (req.file) {
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "genres");
  }

  const genre = await GenreRepository.createGenre({ name, description, color, imageUrl });
  res.status(201).json({ success: true, data: genre });
};

export const updateGenre = async (req: MulterRequest, res: Response) => {
  const existing = await GenreRepository.findGenreById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }

  const { name, description, color, imageUrl: imageUrlFromBody } = req.body;

  let imageUrl: string | undefined = undefined;
  if (req.file) {
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "genres");
  } else if (imageUrlFromBody && imageUrlFromBody !== existing.imageUrl) {
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = imageUrlFromBody;
  }

  const genre = await GenreRepository.updateGenre(req.params.id as string, {
    name,
    description,
    color,
    ...(imageUrl && { imageUrl }),
  });
  res.json({ success: true, data: genre });
};

export const deleteGenre = async (req: MulterRequest, res: Response) => {
  const existing = await GenreRepository.findGenreById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
  await GenreRepository.deleteGenre(req.params.id as string);
  res.json({ success: true, message: "Genre deleted" });
};