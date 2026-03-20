import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as UserService from "./userService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/", ...admin, asyncHandler(UserService.getAllUsers));
router.get("/:id", ...admin, asyncHandler(UserService.getUserById));
router.put("/:id/ban", ...admin, asyncHandler(UserService.banUser));
router.put("/:id/unban", ...admin, asyncHandler(UserService.unbanUser));
router.delete("/:id", ...admin, asyncHandler(UserService.deleteUser));

export default router;
