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
const AdminSongService = __importStar(require("./adminSongService"));
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const roleMiddleware_1 = require("../../../middleware/roleMiddleware");
const upload_1 = require("../../../middleware/upload");
const router = (0, express_1.Router)();
const admin = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("ADMIN")];
// รับไฟล์ได้ 2 field: coverImage (รูปปก) และ audioFile (MP3)
const songUpload = upload_1.uploadSong.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
]);
// stats — ADMIN
router.get("/stats", ...admin, (0, asyncHandler_1.asyncHandler)(AdminSongService.getSongStats));
// play — ทุกคนที่ login เปิดเพลงได้
router.post("/:id/play", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(AdminSongService.playSong));
// CRUD — ADMIN
router.get("/", ...admin, (0, asyncHandler_1.asyncHandler)(AdminSongService.getAllSongs));
router.get("/:id", ...admin, (0, asyncHandler_1.asyncHandler)(AdminSongService.getSongById));
router.post("/", ...admin, songUpload, (0, asyncHandler_1.asyncHandler)(AdminSongService.createSong));
router.put("/:id", ...admin, songUpload, (0, asyncHandler_1.asyncHandler)(AdminSongService.updateSong));
router.delete("/:id", ...admin, (0, asyncHandler_1.asyncHandler)(AdminSongService.deleteSong));
exports.default = router;
//# sourceMappingURL=adminSongRouter.js.map