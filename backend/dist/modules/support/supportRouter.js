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
const authMiddleware_1 = require("../../middleware/authMiddleware");
const roleMiddleware_1 = require("../../middleware/roleMiddleware");
const S = __importStar(require("./supportService"));
const router = (0, express_1.Router)();
const adminOnly = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("ADMIN")];
// User routes (requires login)
router.post("/", authMiddleware_1.authMiddleware, S.submitTicket);
router.get("/my", authMiddleware_1.authMiddleware, S.getMyTickets);
router.get("/my/:id", authMiddleware_1.authMiddleware, S.getMyTicket);
router.post("/my/:id/reply", authMiddleware_1.authMiddleware, S.replyTicket);
// Admin routes
router.get("/admin", ...adminOnly, S.adminGetTickets);
router.get("/admin/:id", ...adminOnly, S.adminGetTicket);
router.post("/admin/:id/reply", ...adminOnly, S.adminReplyTicket);
router.patch("/admin/:id/status", ...adminOnly, S.adminUpdateStatus);
exports.default = router;
//# sourceMappingURL=supportRouter.js.map