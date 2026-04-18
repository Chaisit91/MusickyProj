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
exports.deleteArtist = exports.updateArtist = exports.createArtist = exports.getArtistById = exports.getAllArtists = void 0;
const ArtistRepository = __importStar(require("./artistRepository"));
const uploadImage_1 = require("../../utils/uploadImage");
const getAllArtists = async (req, res) => {
    const artists = await ArtistRepository.findAllArtists();
    res.json({ success: true, data: artists });
};
exports.getAllArtists = getAllArtists;
const getArtistById = async (req, res) => {
    const artist = await ArtistRepository.findArtistById(req.params.id);
    if (!artist) {
        res.status(404).json({ success: false, message: "Artist not found" });
        return;
    }
    res.json({ success: true, data: artist });
};
exports.getArtistById = getArtistById;
const createArtist = async (req, res) => {
    const { name, bio, imageUrl: imageUrlFromBody } = req.body;
    if (!name) {
        res.status(400).json({ success: false, message: "Name is required" });
        return;
    }
    let imageUrl = imageUrlFromBody;
    if (req.file) {
        imageUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "artists");
    }
    const artist = await ArtistRepository.createArtist({ name, bio, imageUrl });
    res.status(201).json({ success: true, data: artist });
};
exports.createArtist = createArtist;
const updateArtist = async (req, res) => {
    const existing = await ArtistRepository.findArtistById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Artist not found" });
        return;
    }
    const { name, bio, imageUrl: imageUrlFromBody } = req.body;
    let imageUrl = undefined;
    if (req.file) {
        if (existing.imageUrl)
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.imageUrl);
        imageUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "artists");
    }
    else if (imageUrlFromBody && imageUrlFromBody !== existing.imageUrl) {
        if (existing.imageUrl)
            await (0, uploadImage_1.deleteImageFromCloudinary)(existing.imageUrl);
        imageUrl = imageUrlFromBody;
    }
    const artist = await ArtistRepository.updateArtist(req.params.id, {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio: bio === "" ? null : bio }),
        ...(imageUrl && { imageUrl }),
    });
    res.json({ success: true, data: artist });
};
exports.updateArtist = updateArtist;
const deleteArtist = async (req, res) => {
    const existing = await ArtistRepository.findArtistById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Artist not found" });
        return;
    }
    if (existing.imageUrl)
        await (0, uploadImage_1.deleteImageFromCloudinary)(existing.imageUrl);
    await ArtistRepository.deleteArtist(req.params.id);
    res.json({ success: true, message: "Artist deleted" });
};
exports.deleteArtist = deleteArtist;
//# sourceMappingURL=artistService.js.map