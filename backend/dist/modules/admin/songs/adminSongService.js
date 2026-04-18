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
exports.playSong = exports.deleteSong = exports.updateSong = exports.createSong = exports.getSongById = exports.getAllSongs = exports.getSongStats = void 0;
const AdminSongRepository = __importStar(require("./adminSongRepository"));
const uploadImage_1 = require("../../../utils/uploadImage");
const getSongStats = async (req, res) => {
    const stats = await AdminSongRepository.getSongStats();
    res.json({ success: true, data: stats });
};
exports.getSongStats = getSongStats;
const getAllSongs = async (req, res) => {
    const { search, genreId, artistId } = req.query;
    const songs = await AdminSongRepository.findAllSongs(search, genreId, artistId);
    res.json({ success: true, data: songs });
};
exports.getAllSongs = getAllSongs;
const getSongById = async (req, res) => {
    const id = req.params.id;
    const song = await AdminSongRepository.findSongById(id);
    if (!song) {
        res.status(404).json({ success: false, message: "Song not found" });
        return;
    }
    res.json({ success: true, data: song });
};
exports.getSongById = getSongById;
const createSong = async (req, res) => {
    var _a, _b;
    const files = req.files;
    const { title, artistId, albumId, genreId, filePath: filePathBody, duration, year, lyrics } = req.body;
    if (!title || !artistId || !albumId || !genreId) {
        res.status(400).json({
            success: false,
            message: "title, artistId, albumId, genreId are required",
        });
        return;
    }
    // --- กำหนด audio source ---
    let filePath;
    if ((_a = files === null || files === void 0 ? void 0 : files.audioFile) === null || _a === void 0 ? void 0 : _a[0]) {
        filePath = await (0, uploadImage_1.uploadAudioToCloudinary)(files.audioFile[0].buffer);
    }
    else if (filePathBody) {
        filePath = filePathBody;
    }
    else {
        res.status(400).json({
            success: false,
            message: "audioFile (MP3) or filePath is required",
        });
        return;
    }
    // --- อัปโหลดรูปปก (ถ้ามี) ---
    let coverUrl;
    if ((_b = files === null || files === void 0 ? void 0 : files.coverImage) === null || _b === void 0 ? void 0 : _b[0]) {
        coverUrl = await (0, uploadImage_1.uploadImageToCloudinary)(files.coverImage[0].buffer, "songs");
    }
    // duration ถูก auto-detect จาก WebAdmin (HTML5 Audio API) และส่งมาเป็น field ปกติ
    const song = await AdminSongRepository.createSong({
        title,
        artistId,
        albumId,
        genreId,
        filePath,
        coverUrl,
        duration: duration ? Number(duration) : undefined,
        year: year ? Number(year) : undefined,
        lyrics,
    });
    res.status(201).json({ success: true, data: song });
};
exports.createSong = createSong;
const updateSong = async (req, res) => {
    var _a, _b, _c;
    const id = req.params.id;
    const existing = await AdminSongRepository.findSongById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Song not found" });
        return;
    }
    const files = req.files;
    const { title, artistId, albumId, genreId, filePath: filePathBody, duration, year, lyrics, deleteCover } = req.body;
    // --- อัปเดต audio source ถ้ามีการส่งมาใหม่ ---
    let filePath;
    if ((_a = files === null || files === void 0 ? void 0 : files.audioFile) === null || _a === void 0 ? void 0 : _a[0]) {
        if ((_b = existing.filePath) === null || _b === void 0 ? void 0 : _b.includes("cloudinary.com")) {
            await (0, uploadImage_1.deleteAudioFromCloudinary)(existing.filePath);
        }
        filePath = await (0, uploadImage_1.uploadAudioToCloudinary)(files.audioFile[0].buffer);
    }
    else if (filePathBody) {
        filePath = filePathBody;
    }
    // --- อัปเดตรูปปก / ลบรูปปก ---
    let coverUrl;
    if (deleteCover === "true") {
        if (existing.coverUrl) {
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.coverUrl).catch(() => { });
        }
        coverUrl = null; // clear in DB
    }
    else if ((_c = files === null || files === void 0 ? void 0 : files.coverImage) === null || _c === void 0 ? void 0 : _c[0]) {
        if (existing.coverUrl) {
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.coverUrl).catch(() => { });
        }
        coverUrl = await (0, uploadImage_1.uploadImageToCloudinary)(files.coverImage[0].buffer, "songs");
    }
    const song = await AdminSongRepository.updateSong(id, {
        ...(title && { title }),
        ...(artistId && { artistId }),
        ...(albumId && { albumId }),
        ...(genreId && { genreId }),
        ...(filePath && { filePath }),
        ...(coverUrl !== undefined && { coverUrl: coverUrl !== null && coverUrl !== void 0 ? coverUrl : undefined }),
        ...(deleteCover === "true" && { coverUrl: null }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(year && { year: Number(year) }),
        ...(lyrics !== undefined && { lyrics }),
    });
    res.json({ success: true, data: song });
};
exports.updateSong = updateSong;
const deleteSong = async (req, res) => {
    var _a, _b;
    const id = req.params.id;
    const existing = await AdminSongRepository.findSongById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Song not found" });
        return;
    }
    if ((_a = existing.filePath) === null || _a === void 0 ? void 0 : _a.includes("cloudinary.com")) {
        await (0, uploadImage_1.deleteAudioFromCloudinary)(existing.filePath);
    }
    if ((_b = existing.coverUrl) === null || _b === void 0 ? void 0 : _b.includes("cloudinary.com")) {
        await (0, uploadImage_1.deleteImageFromCloudinary)(existing.coverUrl);
    }
    await AdminSongRepository.deleteSong(id);
    res.json({ success: true, message: "Song deleted" });
};
exports.deleteSong = deleteSong;
const playSong = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminSongRepository.findSongById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Song not found" });
        return;
    }
    await AdminSongRepository.incrementPlayCount(id);
    res.json({ success: true, message: "Play count updated" });
};
exports.playSong = playSong;
//# sourceMappingURL=adminSongService.js.map