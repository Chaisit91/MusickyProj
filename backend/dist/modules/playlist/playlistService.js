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
exports.removeSong = exports.addSong = exports.deletePlaylist = exports.updatePlaylist = exports.createPlaylist = exports.getPlaylistById = exports.getPlaylists = void 0;
const PlaylistRepository = __importStar(require("./playlistRepository"));
const getPlaylists = async (req, res) => {
    const userId = req.user.id;
    const playlists = await PlaylistRepository.findPlaylistsByUser(userId);
    res.json({ success: true, data: playlists });
};
exports.getPlaylists = getPlaylists;
const getPlaylistById = async (req, res) => {
    const userId = req.user.id;
    const playlist = await PlaylistRepository.findPlaylistById(req.params.id);
    if (!playlist) {
        res.status(404).json({ success: false, message: "Playlist not found" });
        return;
    }
    if (playlist.userId !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    res.json({ success: true, data: playlist });
};
exports.getPlaylistById = getPlaylistById;
const createPlaylist = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ success: false, message: "Name is required" });
        return;
    }
    const playlist = await PlaylistRepository.createPlaylist({ name, userId });
    res.status(201).json({ success: true, data: playlist });
};
exports.createPlaylist = createPlaylist;
const updatePlaylist = async (req, res) => {
    const userId = req.user.id;
    const playlist = await PlaylistRepository.findPlaylistById(req.params.id);
    if (!playlist) {
        res.status(404).json({ success: false, message: "Playlist not found" });
        return;
    }
    if (playlist.userId !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    const { name } = req.body;
    const updated = await PlaylistRepository.updatePlaylist(req.params.id, { name });
    res.json({ success: true, data: updated });
};
exports.updatePlaylist = updatePlaylist;
const deletePlaylist = async (req, res) => {
    const userId = req.user.id;
    const playlist = await PlaylistRepository.findPlaylistById(req.params.id);
    if (!playlist) {
        res.status(404).json({ success: false, message: "Playlist not found" });
        return;
    }
    if (playlist.userId !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    await PlaylistRepository.deletePlaylist(req.params.id);
    res.json({ success: true, message: "Playlist deleted" });
};
exports.deletePlaylist = deletePlaylist;
const addSong = async (req, res) => {
    const userId = req.user.id;
    const playlistId = req.params.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ success: false, message: "songId is required" });
        return;
    }
    const playlist = await PlaylistRepository.findPlaylistById(playlistId);
    if (!playlist) {
        res.status(404).json({ success: false, message: "Playlist not found" });
        return;
    }
    if (playlist.userId !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    const existing = await PlaylistRepository.findPlaylistSong(playlistId, songId);
    if (existing) {
        res.status(409).json({ success: false, message: "Song already in playlist" });
        return;
    }
    const position = await PlaylistRepository.getNextPosition(playlistId);
    const playlistSong = await PlaylistRepository.addSongToPlaylist(playlistId, songId, position);
    res.status(201).json({ success: true, data: playlistSong });
};
exports.addSong = addSong;
const removeSong = async (req, res) => {
    const userId = req.user.id;
    const playlistId = req.params.id;
    const songId = req.params.songId;
    const playlist = await PlaylistRepository.findPlaylistById(playlistId);
    if (!playlist) {
        res.status(404).json({ success: false, message: "Playlist not found" });
        return;
    }
    if (playlist.userId !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    const existing = await PlaylistRepository.findPlaylistSong(playlistId, songId);
    if (!existing) {
        res.status(404).json({ success: false, message: "Song not found in playlist" });
        return;
    }
    await PlaylistRepository.removeSongFromPlaylist(playlistId, songId);
    res.json({ success: true, message: "Song removed from playlist" });
};
exports.removeSong = removeSong;
//# sourceMappingURL=playlistService.js.map