import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as GenreService from "./genreService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();

// Public
router.get("/", asyncHandler(GenreService.getAllGenres));
router.get("/:id", asyncHandler(GenreService.getGenreById));

// ADMIN only
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(GenreService.createGenre));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(GenreService.updateGenre));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(GenreService.deleteGenre));

export default router;
