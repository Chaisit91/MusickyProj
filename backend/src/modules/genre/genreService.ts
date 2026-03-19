import { Request, Response } from "express";
import * as GenreRepository from "./genreRepository";

export const getAllGenres = async (req: Request, res: Response) => {
  const genres = await GenreRepository.findAllGenres();
  res.json({ success: true, data: genres });
};

export const getGenreById = async (req: Request, res: Response) => {
  const genre = await GenreRepository.findGenreById(req.params.id as string);
  if (!genre) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  res.json({ success: true, data: genre });
};

export const createGenre = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }
  const existing = await GenreRepository.findGenreByName(name);
  if (existing) {
    res.status(409).json({ success: false, message: "Genre already exists" });
    return;
  }
  const genre = await GenreRepository.createGenre({ name });
  res.status(201).json({ success: true, data: genre });
};

export const updateGenre = async (req: Request, res: Response) => {
  const existing = await GenreRepository.findGenreById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  const { name } = req.body;
  const genre = await GenreRepository.updateGenre(req.params.id as string, { name });
  res.json({ success: true, data: genre });
};

export const deleteGenre = async (req: Request, res: Response) => {
  const existing = await GenreRepository.findGenreById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Genre not found" });
    return;
  }
  await GenreRepository.deleteGenre(req.params.id as string);
  res.json({ success: true, message: "Genre deleted" });
};
