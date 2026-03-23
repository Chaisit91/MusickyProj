import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as UploadService from "./uploadService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();

// ── ทุก endpoint ต้อง login และเป็น ADMIN ──────────────────────
router.use(authMiddleware, roleMiddleware("ADMIN"));

/**
 * POST /api/upload/:folder
 * folder = artists | albums | genres | ads
 *
 * ตัวอย่าง: POST /api/upload/artists
 * Body: FormData { image: File }
 * Response: { success: true, data: { url: "https://res.cloudinary.com/..." } }
 */
router.post(
  "/:folder",
  upload.single("image"),
  asyncHandler(UploadService.uploadImage)
);

/**
 * DELETE /api/upload
 * Body: { url: "https://res.cloudinary.com/..." }
 * Response: { success: true, message: "Image deleted" }
 */
router.delete("/", asyncHandler(UploadService.deleteImage));

export default router;