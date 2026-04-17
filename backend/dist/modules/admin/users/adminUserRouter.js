"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const AdminUserService = __importStar(require("./adminUserService"));
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const roleMiddleware_1 = require("../../../middleware/roleMiddleware");
const router = (0, express_1.Router)();
const admin = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("ADMIN")];
const adminSSE = [authMiddleware_1.sseAuthMiddleware, (0, roleMiddleware_1.roleMiddleware)("ADMIN")];
router.get("/", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.getAllUsers));
router.get("/stats", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.getUserStats));
router.get("/stats/stream", ...adminSSE, AdminUserService.premiumStatsStream);
router.get("/:id", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.getUserById));
router.put("/:id", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.updateUser));
router.put("/:id/ban", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.banUser));
router.put("/:id/unban", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.unbanUser));
router.delete("/:id", ...admin, (0, asyncHandler_1.asyncHandler)(AdminUserService.deleteUser));
exports.default = router;
//# sourceMappingURL=adminUserRouter.js.map