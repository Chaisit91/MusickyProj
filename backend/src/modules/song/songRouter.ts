import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as SongService from "./songService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();

// Public — ?artistId=&albumId=&genreId=&search=
router.get("/", asyncHandler(SongService.getAllSongs));
router.get("/trending", asyncHandler(SongService.getTrendingSongs));
router.get("/:id/lyrics", asyncHandler(SongService.getSongLyrics));
router.get("/:id", asyncHandler(SongService.getSongById));

// ADMIN only
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(SongService.createSong));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(SongService.updateSong));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(SongService.deleteSong));

export default router;
