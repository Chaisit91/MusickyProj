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
const getSongStats = async (req, res) => {
    const stats = await AdminSongRepository.getSongStats();
    res.json({ success: true, data: stats });
};
exports.getSongStats = getSongStats;
const getAllSongs = async (req, res) => {
    const { search, genreId } = req.query;
    const songs = await AdminSongRepository.findAllSongs(search, genreId);
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
    const { title, artistId, albumId, genreId, filePath, duration, year, lyrics } = req.body;
    if (!title || !artistId || !albumId || !genreId || !filePath) {
        res.status(400).json({ success: false, message: "title, artistId, albumId, genreId and filePath are required" });
        return;
    }
    const song = await AdminSongRepository.createSong({
        title, artistId, albumId, genreId, filePath,
        duration: duration ? Number(duration) : undefined,
        year: year ? Number(year) : undefined,
        lyrics,
    });
    res.status(201).json({ success: true, data: song });
};
exports.createSong = createSong;
const updateSong = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminSongRepository.findSongById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Song not found" });
        return;
    }
    const { title, artistId, albumId, genreId, filePath, duration, year, lyrics } = req.body;
    const song = await AdminSongRepository.updateSong(id, {
        title, artistId, albumId, genreId, filePath,
        duration: duration ? Number(duration) : undefined,
        year: year ? Number(year) : undefined,
        lyrics,
    });
    res.json({ success: true, data: song });
};
exports.updateSong = updateSong;
const deleteSong = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminSongRepository.findSongById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Song not found" });
        return;
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