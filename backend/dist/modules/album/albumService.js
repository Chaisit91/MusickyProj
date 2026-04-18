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
exports.deleteAlbum = exports.updateAlbum = exports.createAlbum = exports.getAlbumsByArtist = exports.getAlbumById = exports.getAllAlbums = void 0;
const AlbumRepository = __importStar(require("./albumRepository"));
const uploadImage_1 = require("../../utils/uploadImage");
const getAllAlbums = async (req, res) => {
    const albums = await AlbumRepository.findAllAlbums();
    res.json({ success: true, data: albums });
};
exports.getAllAlbums = getAllAlbums;
const getAlbumById = async (req, res) => {
    const id = req.params.id;
    const album = await AlbumRepository.findAlbumById(id);
    if (!album) {
        res.status(404).json({ success: false, message: "Album not found" });
        return;
    }
    res.json({ success: true, data: album });
};
exports.getAlbumById = getAlbumById;
const getAlbumsByArtist = async (req, res) => {
    const artistId = req.params.artistId;
    const albums = await AlbumRepository.findAlbumsByArtist(artistId);
    res.json({ success: true, data: albums });
};
exports.getAlbumsByArtist = getAlbumsByArtist;
const createAlbum = async (req, res) => {
    const { title, artistId, releaseDate, coverUrl: coverUrlFromBody } = req.body;
    if (!title || !artistId || !releaseDate) {
        res.status(400).json({
            success: false,
            message: "title, artistId and releaseDate are required",
        });
        return;
    }
    let coverUrl = coverUrlFromBody;
    if (req.file) {
        coverUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "albums");
    }
    const album = await AlbumRepository.createAlbum({
        title: title,
        artistId: artistId,
        releaseDate: releaseDate,
        coverUrl,
    });
    res.status(201).json({ success: true, data: album });
};
exports.createAlbum = createAlbum;
const updateAlbum = async (req, res) => {
    const id = req.params.id;
    const existing = await AlbumRepository.findAlbumById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Album not found" });
        return;
    }
    const { title, artistId, releaseDate, coverUrl: coverUrlFromBody } = req.body;
    let coverUrl = undefined;
    if (req.file) {
        if (existing.coverUrl)
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.coverUrl);
        coverUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "albums");
    }
    else if (coverUrlFromBody && coverUrlFromBody !== existing.coverUrl) {
        if (existing.coverUrl)
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.coverUrl);
        coverUrl = coverUrlFromBody;
    }
    const album = await AlbumRepository.updateAlbum(id, {
        title: title,
        artistId: artistId,
        releaseDate: releaseDate,
        ...(coverUrl && { coverUrl }),
    });
    res.json({ success: true, data: album });
};
exports.updateAlbum = updateAlbum;
const deleteAlbum = async (req, res) => {
    const id = req.params.id;
    const existing = await AlbumRepository.findAlbumById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Album not found" });
        return;
    }
    if (existing.coverUrl)
        await (0, uploadImage_1.deleteImageFromCloudinary)(existing.coverUrl);
    await AlbumRepository.deleteAlbum(id);
    res.json({ success: true, message: "Album deleted" });
};
exports.deleteAlbum = deleteAlbum;
//# sourceMappingURL=albumService.js.map