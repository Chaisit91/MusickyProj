import { prisma } from "../../lib/prisma";
import { AdsCreateInput, AdsUpdateInput } from "./adsModel";

export const findAllAds = async () => {
  return prisma.ads.findMany({ orderBy: { createdAt: "desc" } });
};

export const findActiveAds = async (adType?: string) => {
  const now = new Date();

  // Step 1: try full date-aware query
  const results = await prisma.ads.findMany({
    where: {
      isActive: true,
      ...(adType ? { adType } : {}),
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  console.log(`[AdsRepo] findActiveAds(type=${adType ?? "any"}) step1 → ${results.length} results`);
  if (results.length > 0) return results;

  // Step 2: fallback — ignore date range (for ads with null dates)
  const fallback = await prisma.ads.findMany({
    where: {
      isActive: true,
      ...(adType ? { adType } : {}),
      startDate: null,
      endDate: null,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  console.log(`[AdsRepo] findActiveAds(type=${adType ?? "any"}) step2-fallback → ${fallback.length} results`);
  if (fallback.length > 0) return fallback;

  // Step 3: debug — dump ALL ads to see what's in DB
  const allAds = await prisma.ads.findMany();
  console.log(`[AdsRepo] ALL ads in DB (${allAds.length}):`, allAds.map(a => `id=${a.id.slice(0,8)} type=${a.adType} active=${a.isActive} startDate=${a.startDate} endDate=${a.endDate}`));
  return fallback;
};

export const recordImpression = async (id: string) => {
  return prisma.ads.update({
    where: { id },
    data: { impressions: { increment: 1 } },
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
