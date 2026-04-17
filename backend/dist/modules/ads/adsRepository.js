"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAds = exports.getAdsStats = exports.deleteAds = exports.updateAds = exports.createAds = exports.findAdsById = exports.recordImpression = exports.findActiveAds = exports.findAllAds = void 0;
const prisma_1 = require("../../lib/prisma");
const findAllAds = async () => {
    return prisma_1.prisma.ads.findMany({ orderBy: { createdAt: "desc" } });
};
exports.findAllAds = findAllAds;
const findActiveAds = async (adType) => {
    const now = new Date();
    // ดึง active ads ทั้งหมด (filter adType ถ้ามี) แล้วกรองวันที่ใน JS
    // เพื่อหลีกเลี่ยงปัญหา Prisma AND/OR date query ที่อาจ generate SQL ผิด
    const candidates = await prisma_1.prisma.ads.findMany({
        where: {
            isActive: true,
            ...(adType ? { adType } : {}),
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    const results = candidates.filter((ad) => {
        const afterStart = !ad.startDate || ad.startDate.getTime() <= now.getTime();
        const beforeEnd = !ad.endDate || ad.endDate.getTime() >= now.getTime();
        return afterStart && beforeEnd;
    });
    return results;
};
exports.findActiveAds = findActiveAds;
const recordImpression = async (id) => {
    return prisma_1.prisma.ads.update({
        where: { id },
        data: { impressions: { increment: 1 } },
    });
};
exports.recordImpression = recordImpression;
const findAdsById = async (id) => {
    return prisma_1.prisma.ads.findUnique({ where: { id } });
};
exports.findAdsById = findAdsById;
const createAds = async (data) => {
    return prisma_1.prisma.ads.create({
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
        },
    });
};
exports.createAds = createAds;
const updateAds = async (id, data) => {
    return prisma_1.prisma.ads.update({
        where: { id },
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
    });
};
exports.updateAds = updateAds;
const deleteAds = async (id) => {
    return prisma_1.prisma.ads.delete({ where: { id } });
};
exports.deleteAds = deleteAds;
const getAdsStats = async () => {
    var _a;
    const [totalAds, activeAds, impressionsAgg] = await Promise.all([
        prisma_1.prisma.ads.count(),
        prisma_1.prisma.ads.count({ where: { isActive: true } }),
        prisma_1.prisma.ads.aggregate({ _sum: { impressions: true } }),
    ]);
    return {
        totalAds,
        activeAds,
        totalImpressions: (_a = impressionsAgg._sum.impressions) !== null && _a !== void 0 ? _a : 0,
    };
};
exports.getAdsStats = getAdsStats;
const toggleAds = async (id) => {
    const ads = await prisma_1.prisma.ads.findUnique({ where: { id } });
    if (!ads)
        return null;
    return prisma_1.prisma.ads.update({
        where: { id },
        data: { isActive: !ads.isActive },
    });
};
exports.toggleAds = toggleAds;
//# sourceMappingURL=adsRepository.js.map