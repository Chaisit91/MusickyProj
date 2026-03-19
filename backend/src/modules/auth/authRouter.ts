import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AuthService from "./authService";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// ── Mobile App ─────────────────────────────────────────────────
router.post("/register", asyncHandler(AuthService.register));
router.post("/login", asyncHandler(AuthService.login));

// ── Admin Web ──────────────────────────────────────────────────
router.post("/admin/login", asyncHandler(AuthService.adminLogin));

// ── Token ──────────────────────────────────────────────────────
router.post("/refresh", asyncHandler(AuthService.refresh));

// ── Protected ─────────────────────────────────────────────────
router.get("/me", authMiddleware, asyncHandler(AuthService.getMe));
router.post("/logout", authMiddleware, asyncHandler(AuthService.logout));
router.post("/logout-all", authMiddleware, asyncHandler(AuthService.logoutAll));

export default router;