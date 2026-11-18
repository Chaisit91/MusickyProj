"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAds = exports.incrementImpressions = exports.toggleAds = exports.updateAds = exports.createAds = exports.findAdsById = exports.findActiveAds = exports.findAllAds = exports.getAdsStats = void 0;
const prisma_1 = require("../../../lib/prisma");
const getAdsStats = async () => {
    var _a;
    const [totalAds, activeAds, totalImpressionsAgg] = await Promise.all([
        prisma_1.prisma.ads.count(),
        prisma_1.prisma.ads.count({ where: { isActive: true } }),
        prisma_1.prisma.ads.aggregate({ _sum: { impressions: true } }),
    ]);
    return {
        totalAds,
        activeAds,
        totalImpressions: (_a = totalImpressionsAgg._sum.impressions) !== null && _a !== void 0 ? _a : 0,
    };
};
exports.getAdsStats = getAdsStats;
const findAllAds = async () => {
    return prisma_1.prisma.ads.findMany({ orderBy: { createdAt: "desc" } });
};
exports.findAllAds = findAllAds;
const findActiveAds = async () => {
    return prisma_1.prisma.ads.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });
};
exports.findActiveAds = findActiveAds;
const findAdsById = async (id) => {
    return prisma_1.prisma.ads.findUnique({ where: { id } });
};
exports.findAdsById = findAdsById;
const createAds = async (data) => {
    return prisma_1.prisma.ads.create({ data });
};
exports.createAds = createAds;
const updateAds = async (id, data) => {
    return prisma_1.prisma.ads.update({ where: { id }, data });
};
exports.updateAds = updateAds;
const toggleAds = async (id, isActive) => {
    return prisma_1.prisma.ads.update({ where: { id }, data: { isActive } });
};
exports.toggleAds = toggleAds;
const incrementImpressions = async (id) => {
    return prisma_1.prisma.ads.update({
        where: { id },
        data: { impressions: { increment: 1 } },
    });
};
exports.incrementImpressions = incrementImpressions;
const deleteAds = async (id) => {
    return prisma_1.prisma.ads.delete({ where: { id } });
};
exports.deleteAds = deleteAds;
//# sourceMappingURL=adminAdsRepository.js.map