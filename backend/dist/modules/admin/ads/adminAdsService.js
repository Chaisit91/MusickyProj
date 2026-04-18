"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdsStats = exports.toggleAdStatus = exports.deleteAd = exports.updateAd = exports.createAd = exports.getAdById = exports.getAllAds = void 0;
const AdminAdsRepository = __importStar(require("./adminAdsRepository"));
const uploadImage_1 = require("../../../utils/uploadImage");
// ลบ media เดิม (image หรือ video/audio) ออกจาก Cloudinary
const deleteExistingMedia = async (url, mimetype) => {
    if (!url)
        return;
    const isVideo = url.includes("/video/upload/") || url.includes("resource_type=video");
    if (isVideo || (mimetype && !mimetype.startsWith("image/"))) {
        await (0, uploadImage_1.deleteAudioFromCloudinary)(url); // resource_type: video ครอบคลุม mp4 + mp3
    }
    else {
        await (0, uploadImage_1.deleteImageFromCloudinary)(url);
    }
};
const getAllAds = async (req, res) => {
    const ads = await AdminAdsRepository.findAllAds();
    res.json({ success: true, data: ads });
};
exports.getAllAds = getAllAds;
const getAdById = async (req, res) => {
    const ad = await AdminAdsRepository.findAdsById(req.params.id);
    if (!ad) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    res.json({ success: true, data: ad });
};
exports.getAdById = getAdById;
const createAd = async (req, res) => {
    const { title, adType, adDuration, advertiser, linkUrl, isActive, priority, startDate, endDate } = req.body;
    if (!title || !adType) {
        res.status(400).json({ success: false, message: "title and adType are required" });
        return;
    }
    let mediaUrl;
    if (req.file) {
        mediaUrl = await (0, uploadImage_1.uploadAdMediaToCloudinary)(req.file.buffer, req.file.mimetype);
    }
    if (!mediaUrl) {
        res.status(400).json({ success: false, message: "Media file is required for ads" });
        return;
    }
    const ad = await AdminAdsRepository.createAds({
        title,
        imageUrl: mediaUrl,
        linkUrl: linkUrl || "",
        adType,
        adDuration: adDuration ? Number(adDuration) : 30,
        advertiser: advertiser || "",
        isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
        priority: priority ? Math.min(10, Math.max(1, Number(priority))) : 1,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });
    res.status(201).json({ success: true, data: ad });
};
exports.createAd = createAd;
const updateAd = async (req, res) => {
    const existing = await AdminAdsRepository.findAdsById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    const { title, adType, adDuration, isActive, advertiser, linkUrl, priority, startDate, endDate } = req.body;
    let imageUrl;
    if (req.file) {
        await deleteExistingMedia(existing.imageUrl, req.file.mimetype);
        imageUrl = await (0, uploadImage_1.uploadAdMediaToCloudinary)(req.file.buffer, req.file.mimetype);
    }
    const ad = await AdminAdsRepository.updateAds(req.params.id, {
        title,
        adType,
        adDuration: adDuration ? Number(adDuration) : undefined,
        advertiser,
        linkUrl: linkUrl !== undefined ? linkUrl : undefined,
        isActive: isActive !== undefined ? isActive === "true" || isActive === true : undefined,
        priority: priority !== undefined ? Math.min(10, Math.max(1, Number(priority))) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        ...(imageUrl && { imageUrl }),
    });
    res.json({ success: true, data: ad });
};
exports.updateAd = updateAd;
const deleteAd = async (req, res) => {
    const existing = await AdminAdsRepository.findAdsById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    await deleteExistingMedia(existing.imageUrl);
    await AdminAdsRepository.deleteAds(req.params.id);
    res.json({ success: true, message: "Ad deleted" });
};
exports.deleteAd = deleteAd;
const toggleAdStatus = async (req, res) => {
    const existing = await AdminAdsRepository.findAdsById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    const ad = await AdminAdsRepository.toggleAds(req.params.id, !existing.isActive);
    res.json({ success: true, data: ad });
};
exports.toggleAdStatus = toggleAdStatus;
const getAdsStats = async (req, res) => {
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
exports.getAdsStats = getAdsStats;
//# sourceMappingURL=adminAdsService.js.map