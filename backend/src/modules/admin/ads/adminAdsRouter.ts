import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminAdsService from "./adminAdsService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

// Public — mobile app ดึง active ads และ track impression
router.get("/active", asyncHandler(AdminAdsService.getActiveAds));
router.post("/:id/impression", asyncHandler(AdminAdsService.trackImpression));

// ADMIN
router.get("/stats", ...admin, asyncHandler(AdminAdsService.getAdsStats));
router.get("/", ...admin, asyncHandler(AdminAdsService.getAllAds));
router.get("/:id", ...admin, asyncHandler(AdminAdsService.getAdsById));
router.post("/", ...admin, asyncHandler(AdminAdsService.createAds));
router.put("/:id", ...admin, asyncHandler(AdminAdsService.updateAds));
router.patch("/:id/toggle", ...admin, asyncHandler(AdminAdsService.toggleAds));
router.delete("/:id", ...admin, asyncHandler(AdminAdsService.deleteAds));

export default router;
