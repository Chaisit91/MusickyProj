import { Response } from "express";
import { MulterRequest } from "../../../types/multerRequest";
import * as AdminAdsRepository from "./adminAdsRepository";
import {
  uploadAdMediaToCloudinary,
  deleteImageFromCloudinary,
  deleteAudioFromCloudinary,
} from "../../../utils/uploadImage";

// ลบ media เดิม (image หรือ video/audio) ออกจาก Cloudinary
const deleteExistingMedia = async (url: string, mimetype?: string) => {
  if (!url) return;
  const isVideo = url.includes("/video/upload/") || url.includes("resource_type=video");
  if (isVideo || (mimetype && !mimetype.startsWith("image/"))) {
    await deleteAudioFromCloudinary(url); // resource_type: video ครอบคลุม mp4 + mp3
  } else {
    await deleteImageFromCloudinary(url);
  }
};

export const getAllAds = async (req: MulterRequest, res: Response) => {
  const ads = await AdminAdsRepository.findAllAds();
  res.json({ success: true, data: ads });
};

export const getAdById = async (req: MulterRequest, res: Response) => {
  const ad = await AdminAdsRepository.findAdsById(req.params.id as string);
  if (!ad) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  res.json({ success: true, data: ad });
};

export const createAd = async (req: MulterRequest, res: Response) => {
  const { title, adType, adDuration, advertiser, priority, startDate, endDate } = req.body;

  if (!title || !adType) {
    res.status(400).json({ success: false, message: "title and adType are required" });
    return;
  }

  let mediaUrl: string | undefined;
  if (req.file) {
    mediaUrl = await uploadAdMediaToCloudinary(req.file.buffer, req.file.mimetype);
  }

  if (!mediaUrl) {
    res.status(400).json({ success: false, message: "Media file is required for ads" });
    return;
  }

  const ad = await AdminAdsRepository.createAds({
    title,
    imageUrl: mediaUrl,
    linkUrl: "",
    adType,
    adDuration: adDuration ? Number(adDuration) : 30,
    advertiser: advertiser || "",
    priority: priority ? Math.min(10, Math.max(1, Number(priority))) : 1,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  res.status(201).json({ success: true, data: ad });
};

export const updateAd = async (req: MulterRequest, res: Response) => {
  const existing = await AdminAdsRepository.findAdsById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }

  const { title, adType, adDuration, isActive, advertiser, priority, startDate, endDate } = req.body;

  let imageUrl: string | undefined;
  if (req.file) {
    await deleteExistingMedia(existing.imageUrl, req.file.mimetype);
    imageUrl = await uploadAdMediaToCloudinary(req.file.buffer, req.file.mimetype);
  }

  const ad = await AdminAdsRepository.updateAds(req.params.id as string, {
    title,
    adType,
    adDuration: adDuration ? Number(adDuration) : undefined,
    advertiser,
    isActive: isActive !== undefined ? isActive === "true" || isActive === true : undefined,
    priority: priority !== undefined ? Math.min(10, Math.max(1, Number(priority))) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    ...(imageUrl && { imageUrl }),
  });
  res.json({ success: true, data: ad });
};

export const deleteAd = async (req: MulterRequest, res: Response) => {
  const existing = await AdminAdsRepository.findAdsById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  await deleteExistingMedia(existing.imageUrl);
  await AdminAdsRepository.deleteAds(req.params.id as string);
  res.json({ success: true, message: "Ad deleted" });
};

export const toggleAdStatus = async (req: MulterRequest, res: Response) => {
  const existing = await AdminAdsRepository.findAdsById(req.params.id as string);
  if (!existing) {
    res.status(404).json({ success: false, message: "Ad not found" });
    return;
  }
  const ad = await AdminAdsRepository.toggleAds(req.params.id as string, !existing.isActive);
  res.json({ success: true, data: ad });
};
export const getAdsStats = async (req: MulterRequest, res: Response) => {
  const [totalAds, activeAds, impressionsAgg] = await Promise.all([
    AdminAdsRepository.countAds(),
    AdminAdsRepository.countActiveAds(),
    AdminAdsRepository.sumImpressions(),
  ]);
  res.json({
    success: true,
    data: {
      totalAds,
      activeAds,
      totalImpressions: impressionsAgg,
    },
  });
};