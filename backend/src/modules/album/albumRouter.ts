import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AlbumService from "./albumService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();

// Public
router.get("/", asyncHandler(AlbumService.getAllAlbums));
router.get("/:id", asyncHandler(AlbumService.getAlbumById));
router.get("/artist/:artistId", asyncHandler(AlbumService.getAlbumsByArtist));

// ADMIN only
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AlbumService.createAlbum));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AlbumService.updateAlbum));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AlbumService.deleteAlbum));

export default router;
