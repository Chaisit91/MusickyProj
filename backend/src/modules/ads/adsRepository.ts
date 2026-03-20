import { prisma } from "../../lib/prisma";
import { AdsCreateInput, AdsUpdateInput } from "./adsModel";

export const findAllAds = async () => {
  return prisma.ads.findMany({ orderBy: { createdAt: "desc" } });
};

export const findActiveAds = async () => {
  return prisma.ads.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
};

export const findAdsById = async (id: string) => {
  return prisma.ads.findUnique({ where: { id } });
};

export const createAds = async (data: AdsCreateInput) => {
  return prisma.ads.create({ data });
};

export const updateAds = async (id: string, data: AdsUpdateInput) => {
  return prisma.ads.update({ where: { id }, data });
};

export const deleteAds = async (id: string) => {
  return prisma.ads.delete({ where: { id } });
};
