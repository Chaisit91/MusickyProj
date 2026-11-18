import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminAdsService from "./adminAdsService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";
import { uploadAd } from "../../../middleware/upload";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/stats", asyncHandler(AdminAdsService.getAdsStats));
router.get("/", asyncHandler(AdminAdsService.getAllAds));
router.get("/:id", asyncHandler(AdminAdsService.getAdById));
router.post("/", uploadAd.single("media"), asyncHandler(AdminAdsService.createAd));
router.put("/:id", uploadAd.single("media"), asyncHandler(AdminAdsService.updateAd));
router.delete("/:id", asyncHandler(AdminAdsService.deleteAd));
router.patch("/:id/toggle", asyncHandler(AdminAdsService.toggleAdStatus));

export default router;