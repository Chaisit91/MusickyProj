import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as AdminUserService from "./adminUserService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";

const router = Router();
const admin = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/", ...admin, asyncHandler(AdminUserService.getAllUsers));
router.get("/:id", ...admin, asyncHandler(AdminUserService.getUserById));
router.put("/:id", ...admin, asyncHandler(AdminUserService.updateUser));
router.put("/:id/ban", ...admin, asyncHandler(AdminUserService.banUser));
router.put("/:id/unban", ...admin, asyncHandler(AdminUserService.unbanUser));
router.delete("/:id", ...admin, asyncHandler(AdminUserService.deleteUser));

export default router;
