import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminAdsService from "./adminAdsService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";
import { upload } from "../../../middleware/upload";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/stats", asyncHandler(AdminAdsService.getAdsStats)); // เพิ่มบรรทัดนี้
router.get("/", asyncHandler(AdminAdsService.getAllAds));
router.get("/:id", asyncHandler(AdminAdsService.getAdById));
router.post("/", upload.single("image"), asyncHandler(AdminAdsService.createAd));
router.put("/:id", upload.single("image"), asyncHandler(AdminAdsService.updateAd));
router.delete("/:id", asyncHandler(AdminAdsService.deleteAd));
router.patch("/:id/toggle", asyncHandler(AdminAdsService.toggleAdStatus));

export default router;