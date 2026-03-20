import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as DownloadService from "./downloadService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// All routes require login
router.get("/", authMiddleware, asyncHandler(DownloadService.getDownloads));
router.post("/", authMiddleware, asyncHandler(DownloadService.addDownload));
router.delete("/clear", authMiddleware, asyncHandler(DownloadService.clearAllDownloads));
router.delete("/:id", authMiddleware, asyncHandler(DownloadService.removeDownload));

export default router;
