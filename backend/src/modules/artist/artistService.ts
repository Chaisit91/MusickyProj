import { Response } from "express";
import { MulterRequest } from "../../types/multerRequest";
import * as ArtistRepository from "./artistRepository";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../utils/uploadImage";

export const getAllArtists = async (req: MulterRequest, res: Response) => {
  const artists = await ArtistRepository.findAllArtists();
  res.json({ success: true, data: artists });
};

export const getArtistById = async (req: MulterRequest, res: Response) => {
  const artist = await ArtistRepository.findArtistById(req.params.id as string);
  if (!artist) {
    res.status(404).json({ success: false, message: "Artist not found" });
    return;
  }
  res.json({ success: true, data: artist });
};

export const createArtist = async (req: MulterRequest, res: Response) => {
  const { name, bio, imageUrl: imageUrlFromBody } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }

  let imageUrl: string | undefined = imageUrlFromBody;
  if (req.file) {
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "artists");
  }

  const artist = await ArtistRepository.createArtist({ name, bio, imageUrl });
  res.status(201).json({ success: true, data: artist });
};

export const updateArtist = async (req: MulterRequest, res: Response) => {
  const existing = await ArtistRepository.findArtistById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Artist not found" });
    return;
  }

  const { name, bio, imageUrl: imageUrlFromBody } = req.body;

  let imageUrl: string | undefined = undefined;
  if (req.file) {
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "artists");
  } else if (imageUrlFromBody && imageUrlFromBody !== existing.imageUrl) {
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = imageUrlFromBody;
  }

  const artist = await ArtistRepository.updateArtist(req.params.id as string, {
    ...(name !== undefined && { name }),
    ...(bio !== undefined && { bio: bio === "" ? null : bio }),
    ...(imageUrl && { imageUrl }),
  });
  res.json({ success: true, data: artist });
};

export const deleteArtist = async (req: MulterRequest, res: Response) => {
  const existing = await ArtistRepository.findArtistById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Artist not found" });
    return;
  }
  if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
  await ArtistRepository.deleteArtist(req.params.id as string);
  res.json({ success: true, message: "Artist deleted" });
};