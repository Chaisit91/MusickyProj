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
exports.unlikeSong = exports.likeSong = exports.getLikedSongs = void 0;
const LikedSongRepository = __importStar(require("./likedSongRepository"));
const getLikedSongs = async (req, res) => {
    const userId = req.user.id;
    const likedSongs = await LikedSongRepository.findLikedSongsByUser(userId);
    res.json({ success: true, data: likedSongs });
};
exports.getLikedSongs = getLikedSongs;
const likeSong = async (req, res) => {
    const userId = req.user.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ success: false, message: "songId is required" });
        return;
    }
    const existing = await LikedSongRepository.findLikedSong(userId, songId);
    if (existing) {
        res.status(409).json({ success: false, message: "Song already liked" });
        return;
    }
    const likedSong = await LikedSongRepository.createLikedSong({ userId, songId });
    res.status(201).json({ success: true, data: likedSong });
};
exports.likeSong = likeSong;
const unlikeSong = async (req, res) => {
    const userId = req.user.id;
    const songId = req.params.songId;
    const existing = await LikedSongRepository.findLikedSong(userId, songId);
    if (!existing) {
        res.status(404).json({ success: false, message: "Liked song not found" });
        return;
    }
    await LikedSongRepository.deleteLikedSong(userId, songId);
    res.json({ success: true, message: "Song unliked" });
};
exports.unlikeSong = unlikeSong;
//# sourceMappingURL=likedSongService.js.map