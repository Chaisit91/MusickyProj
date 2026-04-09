import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as ArtistFollowService from "./artistFollowService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, asyncHandler(ArtistFollowService.getFollowedArtists));
router.post("/", authMiddleware, asyncHandler(ArtistFollowService.followArtist));
router.delete("/:artistId", authMiddleware, asyncHandler(ArtistFollowService.unfollowArtist));

export default router;
