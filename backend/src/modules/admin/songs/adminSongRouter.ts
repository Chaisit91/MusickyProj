import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminSongService from "./adminSongService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

// stats — ADMIN
router.get("/stats", ...admin, asyncHandler(AdminSongService.getSongStats));

// play — ทุกคนที่ login เปิดเพลงได้
router.post("/:id/play", authMiddleware, asyncHandler(AdminSongService.playSong));

// CRUD — ADMIN
router.get("/", ...admin, asyncHandler(AdminSongService.getAllSongs));
router.get("/:id", ...admin, asyncHandler(AdminSongService.getSongById));
router.post("/", ...admin, asyncHandler(AdminSongService.createSong));
router.put("/:id", ...admin, asyncHandler(AdminSongService.updateSong));
router.delete("/:id", ...admin, asyncHandler(AdminSongService.deleteSong));

export default router;
