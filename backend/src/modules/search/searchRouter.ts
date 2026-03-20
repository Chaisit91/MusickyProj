import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as SearchService from "./searchService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { optionalAuthMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// Search — ทุกคนค้นหาได้ แต่ถ้า login จะบันทึก history ด้วย
router.get("/", optionalAuthMiddleware, asyncHandler(SearchService.search));

// Search history — ต้อง login
router.get("/history", authMiddleware, asyncHandler(SearchService.getSearchHistory));
router.delete("/history", authMiddleware, asyncHandler(SearchService.clearSearchHistory));

export default router;