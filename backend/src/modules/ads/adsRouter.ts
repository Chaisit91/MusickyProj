import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AdsService from "./adsService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();

// Public — mobile app ดึง ads ที่ active
router.get("/active", asyncHandler(AdsService.getActiveAds));

// ADMIN only
router.get("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AdsService.getAllAds));
router.get("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AdsService.getAdsById));
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AdsService.createAds));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AdsService.updateAds));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(AdsService.deleteAds));

export default router;