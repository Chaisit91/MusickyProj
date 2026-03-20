import { Request, Response } from "express";
import * as AdminAdsRepository from "./adminAdsRepository";

export const getAdsStats = async (req: Request, res: Response) => {
  const stats = await AdminAdsRepository.getAdsStats();
  res.json({ success: true, data: stats });
};

export const getAllAds = async (req: Request, res: Response) => {
  const ads = await AdminAdsRepository.findAllAds();
  res.json({ success: true, data: ads });
};

export const getActiveAds = async (req: Request, res: Response) => {
  const ads = await AdminAdsRepository.findActiveAds();
  res.json({ success: true, data: ads });
};

export const getAdsById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const ads = await AdminAdsRepository.findAdsById(id);
  if (!ads) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  res.json({ success: true, data: ads });
};

export const createAds = async (req: Request, res: Response) => {
  const { title, imageUrl, linkUrl, adType, adDuration, advertiser, isActive } = req.body;
  if (!title || !imageUrl || !linkUrl || !adType || !adDuration || !advertiser) {
    res.status(400).json({ success: false, message: "title, imageUrl, linkUrl, adType, adDuration and advertiser are required" });
    return;
  }
  const ads = await AdminAdsRepository.createAds({
    title, imageUrl, linkUrl, adType,
    adDuration: Number(adDuration),
    advertiser, isActive,
  });
  res.status(201).json({ success: true, data: ads });
};

export const updateAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminAdsRepository.findAdsById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  const { title, imageUrl, linkUrl, adType, adDuration, advertiser, isActive } = req.body;
  const ads = await AdminAdsRepository.updateAds(id, {
    title, imageUrl, linkUrl, adType,
    adDuration: adDuration ? Number(adDuration) : undefined,
    advertiser, isActive,
  });
  res.json({ success: true, data: ads });
};

export const toggleAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminAdsRepository.findAdsById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  const ads = await AdminAdsRepository.toggleAds(id, !existing.isActive);
  res.json({ success: true, data: ads });
};

export const trackImpression = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await AdminAdsRepository.incrementImpressions(id);
  res.json({ success: true, message: "Impression tracked" });
};

export const deleteAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdminAdsRepository.findAdsById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  await AdminAdsRepository.deleteAds(id);
  res.json({ success: true, message: "Ad deleted" });
};
