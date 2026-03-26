import { prisma } from "../../lib/prisma";
import { AdsCreateInput, AdsUpdateInput } from "./adsModel";

export const findAllAds = async () => {
  return prisma.ads.findMany({ orderBy: { createdAt: "desc" } });
};

export const findActiveAds = async () => {
  return prisma.ads.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

export const findAdsById = async (id: string) => {
  return prisma.ads.findUnique({ where: { id } });
};

export const createAds = async (data: AdsCreateInput) => {
  return prisma.ads.create({
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
};

export const updateAds = async (id: string, data: AdsUpdateInput) => {
  return prisma.ads.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
};

export const deleteAds = async (id: string) => {
  return prisma.ads.delete({ where: { id } });
};

export const getAdsStats = async () => {
  const [totalAds, activeAds, impressionsAgg] = await Promise.all([
    prisma.ads.count(),
    prisma.ads.count({ where: { isActive: true } }),
    prisma.ads.aggregate({ _sum: { impressions: true } }),
  ]);
  return {
    totalAds,
    activeAds,
    totalImpressions: impressionsAgg._sum.impressions ?? 0,
  };
};

export const toggleAds = async (id: string) => {
  const ads = await prisma.ads.findUnique({ where: { id } });
  if (!ads) return null;
  return prisma.ads.update({
    where: { id },
    data: { isActive: !ads.isActive },
  });
};
