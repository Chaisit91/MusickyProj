import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";
import { broadcastNotification } from "../payments/adminPaymentService";

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware("ADMIN")];

router.post("/broadcast", ...adminOnly, asyncHandler(broadcastNotification));

export default router;
