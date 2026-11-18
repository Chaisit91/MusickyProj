import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as PlayHistoryService from "./playHistoryService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, asyncHandler(PlayHistoryService.getPlayHistory));
router.post("/", authMiddleware, asyncHandler(PlayHistoryService.recordPlay));
router.delete("/clear-all", authMiddleware, asyncHandler(PlayHistoryService.deleteAllHistory));
router.delete("/:id", authMiddleware, asyncHandler(PlayHistoryService.deleteHistoryRecord));

export default router;
