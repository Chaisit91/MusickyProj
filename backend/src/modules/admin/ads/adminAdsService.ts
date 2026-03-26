import { Response } from "express";
import { MulterRequest } from "../../../types/multerRequest";
import * as AdminAdsRepository from "./adminAdsRepository";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../../../utils/uploadImage";

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
  const { title, linkUrl, adType, adDuration, advertiser, imageUrl: imageUrlFromBody, startDate, endDate } = req.body;

  if (!title || !linkUrl || !adType) {
    res.status(400).json({
      success: false,
      message: "title, linkUrl and adType are required",
    });
    return;
  }

  let imageUrl: string | undefined = imageUrlFromBody;
  if (req.file) {
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "ads");
  }

  if (!imageUrl) {
    res.status(400).json({ success: false, message: "Image is required for ads" });
    return;
  }

  const ad = await AdminAdsRepository.createAds({
    title,
    imageUrl,
    linkUrl,
    adType,
    adDuration: adDuration ? Number(adDuration) : 30,
    advertiser: advertiser || "",
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

  const { title, linkUrl, adType, adDuration, isActive, advertiser, imageUrl: imageUrlFromBody, startDate, endDate } = req.body;

  let imageUrl: string | undefined = undefined;
  if (req.file) {
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = await uploadImageToCloudinary(req.file.buffer, "ads");
  } else if (imageUrlFromBody && imageUrlFromBody !== existing.imageUrl) {
    if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
    imageUrl = imageUrlFromBody;
  }

  const ad = await AdminAdsRepository.updateAds(req.params.id as string, {
    title,
    linkUrl,
    adType,
    adDuration: adDuration ? Number(adDuration) : undefined,
    advertiser,
    isActive: isActive !== undefined ? isActive === "true" || isActive === true : undefined,
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
  if (existing.imageUrl) await deleteImageFromCloudinary(existing.imageUrl);
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