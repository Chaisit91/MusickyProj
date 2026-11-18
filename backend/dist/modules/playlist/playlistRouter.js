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
const PlaylistService = __importStar(require("./playlistService"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All routes require login
router.get("/", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.getPlaylists));
router.get("/:id", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.getPlaylistById));
router.post("/", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.createPlaylist));
router.put("/:id", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.updatePlaylist));
router.delete("/:id", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.deletePlaylist));
// Songs in playlist
router.post("/:id/songs", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.addSong));
router.delete("/:id/songs/:songId", authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(PlaylistService.removeSong));
exports.default = router;
//# sourceMappingURL=playlistRouter.js.map