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
exports.premiumStatsStream = exports.getUserStats = exports.deleteUser = exports.unbanUser = exports.banUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const AdminUserRepository = __importStar(require("./adminUserRepository"));
const getAllUsers = async (req, res) => {
    const { search, status } = req.query;
    const users = await AdminUserRepository.findAllUsers(search, status);
    res.json({ success: true, data: users });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const id = req.params.id;
    const user = await AdminUserRepository.findUserById(id);
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    res.json({ success: true, data: user });
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminUserRepository.findUserById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    const { name, email, isActive, role } = req.body;
    if (role && !Object.values(client_1.Role).includes(role)) {
        res.status(400).json({ success: false, message: "Invalid role. Must be USER or ADMIN" });
        return;
    }
    const user = await AdminUserRepository.updateUser(id, {
        name,
        email,
        isActive,
        role: role,
    });
    res.json({ success: true, data: user });
};
exports.updateUser = updateUser;
const banUser = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminUserRepository.findUserById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    await AdminUserRepository.banUser(id);
    res.json({ success: true, message: "User banned" });
};
exports.banUser = banUser;
const unbanUser = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminUserRepository.findUserById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    await AdminUserRepository.unbanUser(id);
    res.json({ success: true, message: "User unbanned" });
};
exports.unbanUser = unbanUser;
const deleteUser = async (req, res) => {
    const id = req.params.id;
    const existing = await AdminUserRepository.findUserById(id);
    if (!existing) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    await AdminUserRepository.deleteUser(id);
    res.json({ success: true, message: "User deleted" });
};
exports.deleteUser = deleteUser;
const getUserStats = async (req, res) => {
    const stats = await AdminUserRepository.getPremiumStats();
    res.json({ success: true, data: stats });
};
exports.getUserStats = getUserStats;
// ─── SSE: real-time premium stats ─────────────────────────────────────────────
const premiumStatsStream = async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();
    const sendStats = async () => {
        try {
            const stats = await AdminUserRepository.getPremiumStats();
            res.write(`data: ${JSON.stringify(stats)}\n\n`);
        }
        catch (_a) {
            // ignore DB error — keep connection alive
        }
    };
    // ส่งทันทีเมื่อ connect
    await sendStats();
    // ส่งทุก 5 วินาที
    const interval = setInterval(sendStats, 5000);
    // cleanup เมื่อ client ตัด connection
    req.on("close", () => clearInterval(interval));
};
exports.premiumStatsStream = premiumStatsStream;
//# sourceMappingURL=adminUserService.js.map