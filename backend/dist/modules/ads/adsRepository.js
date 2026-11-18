"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAds = exports.updateAds = exports.createAds = exports.findAdsById = exports.findActiveAds = exports.findAllAds = void 0;
const prisma_1 = require("../../lib/prisma");
const findAllAds = async () => {
    return prisma_1.prisma.ads.findMany({ orderBy: { createdAt: "desc" } });
};
exports.findAllAds = findAllAds;
const findActiveAds = async () => {
    return prisma_1.prisma.ads.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
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
const deleteAds = async (id) => {
    return prisma_1.prisma.ads.delete({ where: { id } });
};
exports.deleteAds = deleteAds;
//# sourceMappingURL=adsRepository.js.map