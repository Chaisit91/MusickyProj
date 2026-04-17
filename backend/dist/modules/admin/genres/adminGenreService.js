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
exports.deleteGenre = exports.updateGenre = exports.createGenre = exports.getGenreById = exports.getAllGenres = exports.getGenreStats = void 0;
const AdminGenreRepository = __importStar(require("./adminGenreRepository"));
const uploadImage_1 = require("../../../utils/uploadImage");
const getGenreStats = async (req, res) => {
    const stats = await AdminGenreRepository.getGenreStats();
    res.json({ success: true, data: stats });
};
exports.getGenreStats = getGenreStats;
const getAllGenres = async (req, res) => {
    const genres = await AdminGenreRepository.findAllGenres();
    res.json({ success: true, data: genres });
};
exports.getAllGenres = getAllGenres;
const getGenreById = async (req, res) => {
    const id = req.params.id;
    const genre = await AdminGenreRepository.findGenreById(id);
    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    res.json({ success: true, data: genre });
};
exports.getGenreById = getGenreById;
const createGenre = async (req, res) => {
    const { name, description, color, imageUrl: imageUrlFromBody } = req.body;
    if (!name) {
        res.status(400).json({ success: false, message: "Name is required" });
        return;
    }
    let imageUrl = imageUrlFromBody;
    if (req.file) {
        imageUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "genres");
    }
    const genre = await AdminGenreRepository.createGenre({ name, description, color, imageUrl });
    res.status(201).json({ success: true, data: genre });
};
exports.createGenre = createGenre;
const updateGenre = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminGenreRepository.findGenreById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    const { name, description, color, imageUrl: imageUrlFromBody, removeImage } = req.body;
    let imageUrl = undefined;
    if (req.file) {
        // ✅ มีไฟล์ใหม่ → ลบเก่า + upload ใหม่
        if (existing.imageUrl)
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.imageUrl);
        imageUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "genres");
    }
    else if (removeImage === "true" || removeImage === true) {
        // ✅ กดลบรูป → ลบออกจาก Cloudinary + set null ใน DB
        if (existing.imageUrl)
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.imageUrl);
        imageUrl = null;
    }
    else if (imageUrlFromBody && imageUrlFromBody !== existing.imageUrl) {
        imageUrl = imageUrlFromBody;
    }
    const genre = await AdminGenreRepository.updateGenre(id, {
        name,
        description,
        color,
        // ✅ ถ้า imageUrl เป็น null → set null ใน DB (ลบรูป)
        // ถ้าเป็น undefined → ไม่เปลี่ยนแปลง
        ...(imageUrl !== undefined && { imageUrl }),
    });
    res.json({ success: true, data: genre });
};
exports.updateGenre = updateGenre;
const deleteGenre = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminGenreRepository.findGenreById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    if (existing.imageUrl)
        await (0, uploadImage_1.deleteImageFromCloudinary)(existing.imageUrl);
    await AdminGenreRepository.deleteGenre(id);
    res.json({ success: true, message: "Genre deleted" });
};
exports.deleteGenre = deleteGenre;
//# sourceMappingURL=adminGenreService.js.map