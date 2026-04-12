import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AuthService from "./authService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();

// ── Mobile App ─────────────────────────────────────────────────
router.post("/register", asyncHandler(AuthService.register));
router.post("/login", asyncHandler(AuthService.login));
router.post("/forgot-password", asyncHandler(AuthService.forgotPassword));
router.post("/reset-password", asyncHandler(AuthService.resetPassword));

// ── Admin Web ──────────────────────────────────────────────────
router.post("/admin/login", asyncHandler(AuthService.adminLogin));

// ── Token ──────────────────────────────────────────────────────
router.post("/refresh", asyncHandler(AuthService.refresh));

// ── Google OAuth ───────────────────────────────────────────────
router.post("/google", asyncHandler(AuthService.googleLogin));

// ── Protected ─────────────────────────────────────────────────
router.get("/me", authMiddleware, asyncHandler(AuthService.getMe));
router.patch("/profile", authMiddleware, upload.single("avatar"), asyncHandler(AuthService.updateProfile));
router.post("/logout", authMiddleware, asyncHandler(AuthService.logout));
router.post("/logout-all", authMiddleware, asyncHandler(AuthService.logoutAll));

export default router;