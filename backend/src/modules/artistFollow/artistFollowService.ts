import { Request, Response } from "express";
import * as ArtistFollowRepository from "./artistFollowRepository";

export const getFollowedArtists = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const follows = await ArtistFollowRepository.findFollowedArtistsByUser(userId);
  res.json({ success: true, data: follows.map((f) => f.artist) });
};

export const followArtist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { artistId } = req.body;

  if (!artistId) {
    res.status(400).json({ success: false, message: "artistId is required" });
    return;
  }

  const existing = await ArtistFollowRepository.findArtistFollow(userId, artistId);
  if (existing) {
    res.status(409).json({ success: false, message: "Already following this artist" });
    return;
  }

  const follow = await ArtistFollowRepository.createArtistFollow({ userId, artistId });
  res.status(201).json({ success: true, data: follow.artist });
};

export const unfollowArtist = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const artistId = req.params.artistId as string;

  const existing = await ArtistFollowRepository.findArtistFollow(userId, artistId);
  if (!existing) {
    res.status(404).json({ success: false, message: "Not following this artist" });
    return;
  }

  await ArtistFollowRepository.deleteArtistFollow(userId, artistId);
  res.json({ success: true, message: "Unfollowed artist" });
};
