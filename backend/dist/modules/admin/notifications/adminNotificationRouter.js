"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const roleMiddleware_1 = require("../../../middleware/roleMiddleware");
const adminPaymentService_1 = require("../payments/adminPaymentService");
const router = (0, express_1.Router)();
const adminOnly = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("ADMIN")];
router.post("/broadcast", ...adminOnly, (0, asyncHandler_1.asyncHandler)(adminPaymentService_1.broadcastNotification));
exports.default = router;
//# sourceMappingURL=adminNotificationRouter.js.map