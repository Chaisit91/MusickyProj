import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as GenreService from "./genreService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();

router.get("/", asyncHandler(GenreService.getAllGenres));
router.get("/:id", asyncHandler(GenreService.getGenreById));

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  asyncHandler(GenreService.createGenre)
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("image"),
  asyncHandler(GenreService.updateGenre)
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(GenreService.deleteGenre)
);

export default router;