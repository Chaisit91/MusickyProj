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
exports.deleteAds = exports.updateAds = exports.createAds = exports.getAdsById = exports.getActiveAds = exports.getAllAds = void 0;
const AdsRepository = __importStar(require("./adsRepository"));
const getAllAds = async (req, res) => {
    const ads = await AdsRepository.findAllAds();
    res.json({ success: true, data: ads });
};
exports.getAllAds = getAllAds;
const getActiveAds = async (req, res) => {
    const ads = await AdsRepository.findActiveAds();
    res.json({ success: true, data: ads });
};
exports.getActiveAds = getActiveAds;
const getAdsById = async (req, res) => {
    const id = req.params.id;
    const ads = await AdsRepository.findAdsById(id);
    if (!ads) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    res.json({ success: true, data: ads });
};
exports.getAdsById = getAdsById;
const createAds = async (req, res) => {
    const { title, imageUrl, linkUrl, adType, adDuration, advertiser, isActive } = req.body;
    if (!title || !imageUrl || !linkUrl || !adType || !adDuration || !advertiser) {
        res.status(400).json({ success: false, message: "All fields are required" });
        return;
    }
    const ads = await AdsRepository.createAds({ title, imageUrl, linkUrl, adType, adDuration: Number(adDuration), advertiser, isActive });
    res.status(201).json({ success: true, data: ads });
};
exports.createAds = createAds;
const updateAds = async (req, res) => {
    const id = req.params.id;
    const existing = await AdsRepository.findAdsById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    const { title, imageUrl, linkUrl, adType, adDuration, advertiser, isActive } = req.body;
    const ads = await AdsRepository.updateAds(id, { title, imageUrl, linkUrl, adType, adDuration: adDuration ? Number(adDuration) : undefined, advertiser, isActive });
    res.json({ success: true, data: ads });
};
exports.updateAds = updateAds;
const deleteAds = async (req, res) => {
    const id = req.params.id;
    const existing = await AdsRepository.findAdsById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Ad not found" });
        return;
    }
    await AdsRepository.deleteAds(id);
    res.json({ success: true, message: "Ad deleted" });
};
exports.deleteAds = deleteAds;
//# sourceMappingURL=adsService.js.map