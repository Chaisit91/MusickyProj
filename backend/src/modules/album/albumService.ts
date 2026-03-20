import { Request, Response } from "express";
import * as AlbumRepository from "./albumRepository";

export const getAllAlbums = async (req: Request, res: Response) => {
  const albums = await AlbumRepository.findAllAlbums();
  res.json({ success: true, data: albums });
};

export const getAlbumById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const album = await AlbumRepository.findAlbumById(id);
  if (!album) {
    res.status(404).json({ success: false, message: "Album not found" });
    return;
  }
  res.json({ success: true, data: album });
};

export const getAlbumsByArtist = async (req: Request, res: Response) => {
  const artistId = req.params.artistId as string;
  const albums = await AlbumRepository.findAlbumsByArtist(artistId);
  res.json({ success: true, data: albums });
};

export const createAlbum = async (req: Request, res: Response) => {
  const { title, artistId, releaseDate, coverUrl } = req.body;
  if (!title || !artistId || !releaseDate) {
    res.status(400).json({ success: false, message: "title, artistId and releaseDate are required" });
    return;
  }
  const album = await AlbumRepository.createAlbum({
    title: title as string,
    artistId: artistId as string,
    releaseDate: releaseDate as string,
    coverUrl: coverUrl as string | undefined,
  });
  res.status(201).json({ success: true, data: album });
};

export const updateAlbum = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AlbumRepository.findAlbumById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Album not found" });
    return;
  }
  const { title, artistId, releaseDate, coverUrl } = req.body;
  const album = await AlbumRepository.updateAlbum(id, {
    title: title as string | undefined,
    artistId: artistId as string | undefined,
    releaseDate: releaseDate as string | undefined,
    coverUrl: coverUrl as string | undefined,
  });
  res.json({ success: true, data: album });
};

export const deleteAlbum = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AlbumRepository.findAlbumById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Album not found" });
    return;
  }
  await AlbumRepository.deleteAlbum(id);
  res.json({ success: true, message: "Album deleted" });
};
