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
const asyncHandler_1 = require("../../utils/asyncHandler");
const SearchService = __importStar(require("./searchService"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const authMiddleware_2 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Search — ทุกคนค้นหาได้ แต่ถ้า login จะบันทึก history ด้วย
router.get("/", authMiddleware_2.optionalAuthMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.search));
// AI lyrics search — ค้นหาจากเนื้อเพลงด้วย Claude AI
router.get("/lyrics", authMiddleware_2.optionalAuthMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.lyricsSearch));
// Search history — ต้อง login
router.get("/history", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.getSearchHistory));
router.delete("/history", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.clearSearchHistory));
// Search history items (rich) — ต้อง login
router.get("/history/items", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.getSearchHistoryItems));
router.post("/history/items", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.addSearchHistoryItem));
router.delete("/history/items", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.clearSearchHistoryItems));
router.delete("/history/items/:id", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(SearchService.removeSearchHistoryItem));
exports.default = router;
//# sourceMappingURL=searchRouter.js.map