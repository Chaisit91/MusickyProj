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
const UploadService = __importStar(require("./uploadService"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const roleMiddleware_1 = require("../../middleware/roleMiddleware");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
// ── ทุก endpoint ต้อง login และเป็น ADMIN ──────────────────────
router.use(authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("ADMIN"));
/**
 * POST /api/upload/:folder
 * folder = artists | albums | genres | ads
 *
 * ตัวอย่าง: POST /api/upload/artists
 * Body: FormData { image: File }
 * Response: { success: true, data: { url: "https://res.cloudinary.com/..." } }
 */
router.post("/:folder", upload_1.upload.single("image"), (0, asyncHandler_1.asyncHandler)(UploadService.uploadImage));
/**
 * DELETE /api/upload
 * Body: { url: "https://res.cloudinary.com/..." }
 * Response: { success: true, message: "Image deleted" }
 */
router.delete("/", (0, asyncHandler_1.asyncHandler)(UploadService.deleteImage));
exports.default = router;
//# sourceMappingURL=uploadRouter.js.map