import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AdsService from "./adsService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/active", asyncHandler(AdsService.getActiveAds));
router.get("/", ...admin, asyncHandler(AdsService.getAllAds));
router.get("/:id", ...admin, asyncHandler(AdsService.getAdsById));
router.post("/", ...admin, asyncHandler(AdsService.createAds));
router.put("/:id", ...admin, asyncHandler(AdsService.updateAds));
router.delete("/:id", ...admin, asyncHandler(AdsService.deleteAds));

export default router;
