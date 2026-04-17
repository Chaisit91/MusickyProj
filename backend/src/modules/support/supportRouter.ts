import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { roleMiddleware } from "../../middleware/roleMiddleware";
import * as S from "./supportService";

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware("ADMIN")];

// User routes (requires login)
router.post("/", authMiddleware, S.submitTicket);
router.get("/my", authMiddleware, S.getMyTickets);
router.get("/my/:id", authMiddleware, S.getMyTicket);
router.post("/my/:id/reply", authMiddleware, S.replyTicket);

// Admin routes
router.get("/admin", ...adminOnly, S.adminGetTickets);
router.get("/admin/:id", ...adminOnly, S.adminGetTicket);
router.post("/admin/:id/reply", ...adminOnly, S.adminReplyTicket);
router.patch("/admin/:id/status", ...adminOnly, S.adminUpdateStatus);

export default router;
