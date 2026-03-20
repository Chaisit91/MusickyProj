import { Router } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as DashboardService from "./dashboardService";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { roleMiddleware } from "../../../middleware/roleMiddleware";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(DashboardService.getDashboard));

export default router;
