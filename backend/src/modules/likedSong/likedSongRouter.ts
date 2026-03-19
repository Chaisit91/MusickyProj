import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as LikedSongService from "./likedSongService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// All routes require login — เข้าถึงได้เฉพาะของตัวเอง
router.get("/", authMiddleware, asyncHandler(LikedSongService.getLikedSongs));
router.post("/", authMiddleware, asyncHandler(LikedSongService.likeSong));
router.delete("/:songId", authMiddleware, asyncHandler(LikedSongService.unlikeSong));

export default router;
