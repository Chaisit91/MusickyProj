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
exports.clearAllDownloads = exports.removeDownload = exports.addDownload = exports.getDownloads = void 0;
const DownloadRepository = __importStar(require("./downloadRepository"));
const getDownloads = async (req, res) => {
    const userId = req.user.id;
    const downloads = await DownloadRepository.findDownloadsByUser(userId);
    res.json({ success: true, data: downloads });
};
exports.getDownloads = getDownloads;
const addDownload = async (req, res) => {
    const userId = req.user.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ success: false, message: "songId is required" });
        return;
    }
    // อนุญาตให้ download เพลงเดิมซ้ำได้ (บันทึกทุกครั้ง)
    const download = await DownloadRepository.createDownload({ userId, songId });
    res.status(201).json({ success: true, data: download });
};
exports.addDownload = addDownload;
const removeDownload = async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;
    // ตรวจสอบว่า download นี้เป็นของ user นี้จริง
    const downloads = await DownloadRepository.findDownloadsByUser(userId);
    const owned = downloads.find((d) => d.id === id);
    if (!owned) {
        res.status(404).json({ success: false, message: "Download not found" });
        return;
    }
    await DownloadRepository.deleteDownload(id);
    res.json({ success: true, message: "Download removed" });
};
exports.removeDownload = removeDownload;
const clearAllDownloads = async (req, res) => {
    const userId = req.user.id;
    await DownloadRepository.deleteAllDownloadsByUser(userId);
    res.json({ success: true, message: "All downloads cleared" });
};
exports.clearAllDownloads = clearAllDownloads;
//# sourceMappingURL=downloadService.js.map