import { Response } from "express";
import { MulterRequest } from "../../types/multerRequest";
import * as AlbumRepository from "./albumRepository";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../utils/uploadImage";

export const getAllAlbums = async (req: MulterRequest, res: Response) => {
  const albums = await AlbumRepository.findAllAlbums();
  res.json({ success: true, data: albums });
};

export const getAlbumById = async (req: MulterRequest, res: Response) => {
  const id = req.params.id as string;
  const album = await AlbumRepository.findAlbumById(id);
  if (!album) {
    res.status(404).json({ success: false, message: "Album not found" });
    return;
  }
  res.json({ success: true, data: album });
};

export const getAlbumsByArtist = async (req: MulterRequest, res: Response) => {
  const artistId = req.params.artistId as string;
  const albums = await AlbumRepository.findAlbumsByArtist(artistId);
  res.json({ success: true, data: albums });
};

export const createAlbum = async (req: MulterRequest, res: Response) => {
  const { title, artistId, releaseDate, coverUrl: coverUrlFromBody } = req.body;
  if (!title || !artistId || !releaseDate) {
    res.status(400).json({
      success: false,
      message: "title, artistId and releaseDate are required",
    });
    return;
  }

  let coverUrl: string | undefined = coverUrlFromBody;
  if (req.file) {
    coverUrl = await uploadImageToCloudinary(req.file.buffer, "albums");
  }

  const album = await AlbumRepository.createAlbum({
    title: title as string,
    artistId: artistId as string,
    releaseDate: releaseDate as string,
    coverUrl,
  });
  res.status(201).json({ success: true, data: album });
};

export const updateAlbum = async (req: MulterRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await AlbumRepository.findAlbumById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Album not found" });
    return;
  }

  const { title, artistId, releaseDate, coverUrl: coverUrlFromBody } = req.body;

  let coverUrl: string | undefined = undefined;
  if (req.file) {
    if (existing.coverUrl) await deleteImageFromCloudinary(existing.coverUrl);
    coverUrl = await uploadImageToCloudinary(req.file.buffer, "albums");
  } else if (coverUrlFromBody && coverUrlFromBody !== existing.coverUrl) {
    if (existing.coverUrl) await deleteImageFromCloudinary(existing.coverUrl);
    coverUrl = coverUrlFromBody;
  }

  const album = await AlbumRepository.updateAlbum(id, {
    title: title as string | undefined,
    artistId: artistId as string | undefined,
    releaseDate: releaseDate as string | undefined,
    ...(coverUrl && { coverUrl }),
  });
  res.json({ success: true, data: album });
};

export const deleteAlbum = async (req: MulterRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await AlbumRepository.findAlbumById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Album not found" });
    return;
  }
  if (existing.coverUrl) await deleteImageFromCloudinary(existing.coverUrl);
  await AlbumRepository.deleteAlbum(id);
  res.json({ success: true, message: "Album deleted" });
};