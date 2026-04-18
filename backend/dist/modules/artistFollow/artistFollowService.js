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
exports.unfollowArtist = exports.followArtist = exports.getFollowedArtists = void 0;
const ArtistFollowRepository = __importStar(require("./artistFollowRepository"));
const getFollowedArtists = async (req, res) => {
    const userId = req.user.id;
    const follows = await ArtistFollowRepository.findFollowedArtistsByUser(userId);
    res.json({ success: true, data: follows.map((f) => f.artist) });
};
exports.getFollowedArtists = getFollowedArtists;
const followArtist = async (req, res) => {
    const userId = req.user.id;
    const { artistId } = req.body;
    if (!artistId) {
        res.status(400).json({ success: false, message: "artistId is required" });
        return;
    }
    const existing = await ArtistFollowRepository.findArtistFollow(userId, artistId);
    if (existing) {
        res.status(409).json({ success: false, message: "Already following this artist" });
        return;
    }
    const follow = await ArtistFollowRepository.createArtistFollow({ userId, artistId });
    res.status(201).json({ success: true, data: follow.artist });
};
exports.followArtist = followArtist;
const unfollowArtist = async (req, res) => {
    const userId = req.user.id;
    const artistId = req.params.artistId;
    const existing = await ArtistFollowRepository.findArtistFollow(userId, artistId);
    if (!existing) {
        res.status(404).json({ success: false, message: "Not following this artist" });
        return;
    }
    await ArtistFollowRepository.deleteArtistFollow(userId, artistId);
    res.json({ success: true, message: "Unfollowed artist" });
};
exports.unfollowArtist = unfollowArtist;
//# sourceMappingURL=artistFollowService.js.map