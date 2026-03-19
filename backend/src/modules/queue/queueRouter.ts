import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as QueueService from "./queueService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// All routes require login
router.get("/", authMiddleware, asyncHandler(QueueService.getQueue));
router.post("/", authMiddleware, asyncHandler(QueueService.addToQueue));
router.post("/reorder", authMiddleware, asyncHandler(QueueService.reorderQueue));
router.delete("/clear", authMiddleware, asyncHandler(QueueService.clearQueue));
router.delete("/:id", authMiddleware, asyncHandler(QueueService.removeFromQueue));

export default router;
