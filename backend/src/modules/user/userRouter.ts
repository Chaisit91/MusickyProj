import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as UserService from "./userService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();

// ADMIN only
router.get("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(UserService.getAllUsers));
router.get("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(UserService.getUserById));
router.put("/:id/ban", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(UserService.banUser));
router.put("/:id/unban", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(UserService.unbanUser));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(UserService.deleteUser));

export default router;