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
exports.recordPlay = exports.deleteHistoryRecord = exports.deleteAllHistory = exports.getPlayHistory = void 0;
const PlayHistoryRepository = __importStar(require("./playHistoryRepository"));
const getPlayHistory = async (req, res) => {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const history = await PlayHistoryRepository.findPlayHistory(userId, limit);
    res.json({ success: true, data: history });
};
exports.getPlayHistory = getPlayHistory;
const deleteAllHistory = async (req, res) => {
    const userId = req.user.id;
    await PlayHistoryRepository.deleteAllHistory(userId);
    res.json({ success: true, message: "All history deleted" });
};
exports.deleteAllHistory = deleteAllHistory;
const deleteHistoryRecord = async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;
    const record = await PlayHistoryRepository.findHistoryRecord(id, userId);
    if (!record) {
        res.status(404).json({ success: false, message: "Record not found" });
        return;
    }
    await PlayHistoryRepository.deleteHistoryRecord(id);
    res.json({ success: true, message: "Deleted" });
};
exports.deleteHistoryRecord = deleteHistoryRecord;
const recordPlay = async (req, res) => {
    const userId = req.user.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ success: false, message: "songId is required" });
        return;
    }
    const record = await PlayHistoryRepository.recordPlay(userId, songId);
    res.status(201).json({ success: true, data: record });
};
exports.recordPlay = recordPlay;
//# sourceMappingURL=playHistoryService.js.map