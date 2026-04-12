import { Request, Response } from "express";
import * as AdsRepository from "./adsRepository";

export const getAllAds = async (req: Request, res: Response) => {
  const ads = await AdsRepository.findAllAds();
  res.json({ success: true, data: ads });
};

export const getActiveAds = async (req: Request, res: Response) => {
  const adType = req.query.type as string | undefined;
  const ads = await AdsRepository.findActiveAds(adType);
  // สุ่มเลือก 1 อัน จาก ads ที่เจอ
  const picked = ads.length > 0 ? ads[Math.floor(Math.random() * ads.length)] : null;
  res.json({ success: true, data: picked });
};

export const recordImpression = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await AdsRepository.recordImpression(id);
  res.json({ success: true });
};

export const getAdsById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const ads = await AdsRepository.findAdsById(id);
  if (!ads) { res.status(404).json({ success: false, message: "Ad not found" }); return; }
  res.json({ success: true, data: ads });
};

export const createAds = async (req: Request, res: Response) => {
  const { title, imageUrl, linkUrl, adType, adDuration, advertiser, isActive } = req.body;
  if (!title || !imageUrl || !linkUrl || !adType || !adDuration || !advertiser) {
    res.status(400).json({ success: false, message: "All fields are required" }); return;
  }
  const ads = await AdsRepository.createAds({ title, imageUrl, linkUrl, adType, adDuration: Number(adDuration), advertiser, isActive });
  res.status(201).json({ success: true, data: ads });
};

export const updateAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdsRepository.findAdsById(id);
  if (!existing) { res.status(404).json({ success: false, message: "Ad not found" }); return; }
  const { title, imageUrl, linkUrl, adType, adDuration, advertiser, isActive } = req.body;
  const ads = await AdsRepository.updateAds(id, { title, imageUrl, linkUrl, adType, adDuration: adDuration ? Number(adDuration) : undefined, advertiser, isActive });
  res.json({ success: true, data: ads });
};

export const deleteAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdsRepository.findAdsById(id);
  if (!existing) { res.status(404).json({ success: false, message: "Ad not found" }); return; }
  await AdsRepository.deleteAds(id);
  res.json({ success: true, message: "Ad deleted" });
};
export const getAdsStats = async (req: Request, res: Response) => {
  const stats = await AdsRepository.getAdsStats();
  res.json({ success: true, data: stats });
};

export const toggleAds = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = await AdsRepository.findAdsById(id);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  const ads = await AdsRepository.toggleAds(id);
  res.json({ success: true, data: ads });
};