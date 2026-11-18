import { prisma } from "../../../lib/prisma";

export const getAdsStats = async () => {
  const [totalAds, activeAds, totalImpressionsAgg] = await Promise.all([
    prisma.ads.count(),
    prisma.ads.count({ where: { isActive: true } }),
    prisma.ads.aggregate({ _sum: { impressions: true } }),
  ]);
  return {
    totalAds,
    activeAds,
    totalImpressions: totalImpressionsAgg._sum.impressions ?? 0,
  };
};

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

export const createAds = async (data: {
  title: string;
  imageUrl: string;
  linkUrl: string;
  adType: string;
  adDuration: number;
  advertiser: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return prisma.ads.create({
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
};

export const updateAds = async (id: string, data: {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  adType?: string;
  adDuration?: number;
  advertiser?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return prisma.ads.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
};

export const toggleAds = async (id: string, isActive: boolean) => {
  return prisma.ads.update({ where: { id }, data: { isActive } });
};

export const incrementImpressions = async (id: string) => {
  return prisma.ads.update({
    where: { id },
    data: { impressions: { increment: 1 } },
  });
};

export const deleteAds = async (id: string) => {
  return prisma.ads.delete({ where: { id } });
};
export const countAds = async () => {
  return prisma.ads.count();
};

export const countActiveAds = async () => {
  return prisma.ads.count({ where: { isActive: true } });
};

export const sumImpressions = async () => {
  const result = await prisma.ads.aggregate({ _sum: { impressions: true } });
  return result._sum.impressions ?? 0;
};