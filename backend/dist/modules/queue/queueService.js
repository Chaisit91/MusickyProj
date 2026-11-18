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
exports.reorderQueue = exports.clearQueue = exports.removeFromQueue = exports.addToQueue = exports.getQueue = void 0;
const QueueRepository = __importStar(require("./queueRepository"));
const getQueue = async (req, res) => {
    const userId = req.user.id;
    const queue = await QueueRepository.findQueueByUser(userId);
    res.json({ success: true, data: queue });
};
exports.getQueue = getQueue;
const addToQueue = async (req, res) => {
    const userId = req.user.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ success: false, message: "songId is required" });
        return;
    }
    const position = await QueueRepository.getNextQueuePosition(userId);
    const item = await QueueRepository.addToQueue({ userId, songId }, position);
    res.status(201).json({ success: true, data: item });
};
exports.addToQueue = addToQueue;
const removeFromQueue = async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;
    const item = await QueueRepository.findQueueItemById(id);
    if (!item) {
        res.status(404).json({ success: false, message: "Queue item not found" });
        return;
    }
    if (item.userId !== userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    await QueueRepository.removeFromQueue(id);
    res.json({ success: true, message: "Removed from queue" });
};
exports.removeFromQueue = removeFromQueue;
const clearQueue = async (req, res) => {
    const userId = req.user.id;
    await QueueRepository.clearQueue(userId);
    res.json({ success: true, message: "Queue cleared" });
};
exports.clearQueue = clearQueue;
const reorderQueue = async (req, res) => {
    const userId = req.user.id;
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        res.status(400).json({ success: false, message: "orderedIds must be a non-empty array" });
        return;
    }
    // ตรวจสอบว่า ids ทั้งหมดเป็นของ user นี้
    const queue = await QueueRepository.findQueueByUser(userId);
    const userQueueIds = queue.map((q) => q.id);
    const allOwned = orderedIds.every((id) => userQueueIds.includes(id));
    if (!allOwned) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
    }
    await QueueRepository.reorderQueue(userId, orderedIds);
    const updated = await QueueRepository.findQueueByUser(userId);
    res.json({ success: true, data: updated });
};
exports.reorderQueue = reorderQueue;
//# sourceMappingURL=queueService.js.map