import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminGenreService from "./adminGenreService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";
import { upload } from "../../../middleware/upload"; // ✅ เพิ่ม multer

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/stats", ...admin, asyncHandler(AdminGenreService.getGenreStats));
router.get("/", ...admin, asyncHandler(AdminGenreService.getAllGenres));
router.get("/:id", ...admin, asyncHandler(AdminGenreService.getGenreById));

// ✅ เพิ่ม upload.single("image") — parse FormData + รับไฟล์รูป
router.post("/", ...admin, upload.single("image"), asyncHandler(AdminGenreService.createGenre));
router.put("/:id", ...admin, upload.single("image"), asyncHandler(AdminGenreService.updateGenre));
router.delete("/:id", ...admin, asyncHandler(AdminGenreService.deleteGenre));

export default router;