import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminGenreService from "./adminGenreService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/stats", ...admin, asyncHandler(AdminGenreService.getGenreStats));
router.get("/", ...admin, asyncHandler(AdminGenreService.getAllGenres));
router.get("/:id", ...admin, asyncHandler(AdminGenreService.getGenreById));
router.post("/", ...admin, asyncHandler(AdminGenreService.createGenre));
router.put("/:id", ...admin, asyncHandler(AdminGenreService.updateGenre));
router.delete("/:id", ...admin, asyncHandler(AdminGenreService.deleteGenre));

export default router;
