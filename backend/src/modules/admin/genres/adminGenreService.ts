import { Request, Response } from "express";
import * as AdminGenreRepository from "./adminGenreRepository";

export const getGenreStats = async (req: Request, res: Response) => {
  const stats = await AdminGenreRepository.getGenreStats();
  res.json({ success: true, data: stats });
};

export const getAllGenres = async (req: Request, res: Response) => {
  const genres = await AdminGenreRepository.findAllGenres();
  res.json({ success: true, data: genres });
};

export const getGenreById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const genre = await AdminGenreRepository.findGenreById(id);
  if (!genre) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  res.json({ success: true, data: genre });
};

export const createGenre = async (req: Request, res: Response) => {
  const { name, description, imageUrl, color } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }
  const genre = await AdminGenreRepository.createGenre({ name, description, imageUrl, color });
  res.status(201).json({ success: true, data: genre });
};

export const updateGenre = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminGenreRepository.findGenreById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  const { name, description, imageUrl, color } = req.body;
  const genre = await AdminGenreRepository.updateGenre(id, { name, description, imageUrl, color });
  res.json({ success: true, data: genre });
};

export const deleteGenre = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminGenreRepository.findGenreById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  await AdminGenreRepository.deleteGenre(id);
  res.json({ success: true, message: "Genre and related songs deleted" });
};
