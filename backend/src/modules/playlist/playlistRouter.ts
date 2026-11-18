import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as PlaylistService from "./playlistService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// All routes require login
router.get("/", authMiddleware, asyncHandler(PlaylistService.getPlaylists));
router.get("/:id", authMiddleware, asyncHandler(PlaylistService.getPlaylistById));
router.post("/", authMiddleware, asyncHandler(PlaylistService.createPlaylist));
router.put("/:id", authMiddleware, asyncHandler(PlaylistService.updatePlaylist));
router.delete("/:id", authMiddleware, asyncHandler(PlaylistService.deletePlaylist));

// Songs in playlist
router.post("/:id/songs", authMiddleware, asyncHandler(PlaylistService.addSong));
router.delete("/:id/songs/:songId", authMiddleware, asyncHandler(PlaylistService.removeSong));

export default router;
