import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AlbumService from "./albumService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();

router.get("/", asyncHandler(AlbumService.getAllAlbums));
router.get("/artist/:artistId", asyncHandler(AlbumService.getAlbumsByArtist));
router.get("/:id", asyncHandler(AlbumService.getAlbumById));

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  asyncHandler(AlbumService.createAlbum)
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  asyncHandler(AlbumService.updateAlbum)
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(AlbumService.deleteAlbum)
);

export default router;