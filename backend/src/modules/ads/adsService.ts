import { Request, Response } from "express";
import * as AdsRepository from "./adsRepository";

export const getAllAds = async (req: Request, res: Response) => {
  const ads = await AdsRepository.findAllAds();
  res.json({ success: true, data: ads });
};

export const getActiveAds = async (req: Request, res: Response) => {
  const ads = await AdsRepository.findActiveAds();
  res.json({ success: true, data: ads });
};

export const getAdsById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const ads = await AdsRepository.findAdsById(id);
  if (!ads) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  res.json({ success: true, data: ads });
};

export const createAds = async (req: Request, res: Response) => {
  const { title, imageUrl, linkUrl, isActive } = req.body;
  if (!title || !imageUrl || !linkUrl) {
    res.status(400).json({ success: false, message: "title, imageUrl and linkUrl are required" });
    return;
  }
  const ads = await AdsRepository.createAds({ title, imageUrl, linkUrl, isActive });
  res.status(201).json({ success: true, data: ads });
};

export const updateAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdsRepository.findAdsById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  const { title, imageUrl, linkUrl, isActive } = req.body;
  const ads = await AdsRepository.updateAds(id, { title, imageUrl, linkUrl, isActive });
  res.json({ success: true, data: ads });
};

export const deleteAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdsRepository.findAdsById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  await AdsRepository.deleteAds(id);
  res.json({ success: true, message: "Ad deleted" });
};