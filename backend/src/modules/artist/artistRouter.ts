import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as ArtistService from "./artistService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();

router.get("/", asyncHandler(ArtistService.getAllArtists));
router.get("/:id", asyncHandler(ArtistService.getArtistById));

// ✅ upload.single("image") — รองรับทั้งส่งไฟล์โดยตรง หรือส่ง imageUrl ใน body
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  asyncHandler(ArtistService.createArtist)
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  asyncHandler(ArtistService.updateArtist)
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(ArtistService.deleteArtist)
);

export default router;