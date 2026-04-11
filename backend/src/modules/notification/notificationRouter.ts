import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as NotificationService from "./notificationService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(NotificationService.getMyNotifications));
router.patch("/:id/read", asyncHandler(NotificationService.markNotificationRead));
router.patch("/read-all", asyncHandler(NotificationService.markAllNotificationsRead));

export default router;
