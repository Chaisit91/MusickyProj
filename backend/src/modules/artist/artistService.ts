import { Request, Response } from "express";
import * as ArtistRepository from "./artistRepository";

export const getAllArtists = async (req: Request, res: Response) => {
  const artists = await ArtistRepository.findAllArtists();
  res.json({ success: true, data: artists });
};

export const getArtistById = async (req: Request, res: Response) => {
  const artist = await ArtistRepository.findArtistById(req.params.id as string);
  if (!artist) {
    res.status(404).json({ success: false, message: "Artist not found" });
    return;
  }
  res.json({ success: true, data: artist });
};

export const createArtist = async (req: Request, res: Response) => {
  const { name, bio, imageUrl } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }
  const artist = await ArtistRepository.createArtist({ name, bio, imageUrl });
  res.status(201).json({ success: true, data: artist });
};

export const updateArtist = async (req: Request, res: Response) => {
  const existing = await ArtistRepository.findArtistById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Artist not found" });
    return;
  }
  const { name, bio, imageUrl } = req.body;
  const artist = await ArtistRepository.updateArtist(req.params.id as string, { name, bio, imageUrl });
  res.json({ success: true, data: artist });
};

export const deleteArtist = async (req: Request, res: Response) => {
  const existing = await ArtistRepository.findArtistById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Artist not found" });
    return;
  }
  await ArtistRepository.deleteArtist(req.params.id as string);
  res.json({ success: true, message: "Artist deleted" });
};
