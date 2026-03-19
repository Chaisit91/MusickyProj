import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as ArtistService from "./artistService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();

// Public
router.get("/", asyncHandler(ArtistService.getAllArtists));
router.get("/:id", asyncHandler(ArtistService.getArtistById));

// ADMIN only
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(ArtistService.createArtist));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(ArtistService.updateArtist));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(ArtistService.deleteArtist));

export default router;
