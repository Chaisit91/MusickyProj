import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";
import * as AdminPaymentService from "./adminPaymentService";

const router = Router();
const adminOnly = [authMiddleware, roleMiddleware("ADMIN")];

router.get("/", ...adminOnly, asyncHandler(AdminPaymentService.getAllTransactions));
router.patch("/:id/approve", ...adminOnly, asyncHandler(AdminPaymentService.approveTransaction));
router.patch("/:id/reject", ...adminOnly, asyncHandler(AdminPaymentService.rejectTransaction));

export default router;
