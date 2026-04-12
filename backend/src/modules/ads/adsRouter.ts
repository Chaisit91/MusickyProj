import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AdsService from "./adsService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/active", asyncHandler(AdsService.getActiveAds));
router.post("/:id/impression", asyncHandler(AdsService.recordImpression));
router.get("/stats", ...admin, asyncHandler(AdsService.getAdsStats));      // เพิ่ม
router.get("/", ...admin, asyncHandler(AdsService.getAllAds));
router.get("/:id", ...admin, asyncHandler(AdsService.getAdsById));
router.post("/", ...admin, asyncHandler(AdsService.createAds));
router.put("/:id", ...admin, asyncHandler(AdsService.updateAds));
router.patch("/:id/toggle", ...admin, asyncHandler(AdsService.toggleAds)); // เพิ่ม
router.delete("/:id", ...admin, asyncHandler(AdsService.deleteAds));

export default router;