import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as PaymentService from "./paymentService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();

router.use(authMiddleware);

router.post("/", upload.single("slip"), asyncHandler(PaymentService.submitPayment));
router.get("/my", asyncHandler(PaymentService.getMyTransactions));

export default router;
