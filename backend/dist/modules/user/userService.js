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
exports.updateMyPreferences = exports.getMyPreferences = exports.deleteUser = exports.unbanUser = exports.banUser = exports.getUserById = exports.getAllUsers = void 0;
const UserRepository = __importStar(require("./userRepository"));
const prisma_1 = require("../../lib/prisma");
const getAllUsers = async (req, res) => {
    const users = await UserRepository.findAllUsers();
    res.json({ success: true, data: users });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const id = req.params.id;
    const user = await UserRepository.findUserById(id);
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    res.json({ success: true, data: user });
};
exports.getUserById = getUserById;
const banUser = async (req, res) => {
    const id = req.params.id;
    await UserRepository.banUser(id);
    res.json({ success: true, message: "User banned" });
};
exports.banUser = banUser;
const unbanUser = async (req, res) => {
    const id = req.params.id;
    await UserRepository.unbanUser(id);
    res.json({ success: true, message: "User unbanned" });
};
exports.unbanUser = unbanUser;
const deleteUser = async (req, res) => {
    const id = req.params.id;
    await UserRepository.deleteUser(id);
    res.json({ success: true, message: "User deleted" });
};
exports.deleteUser = deleteUser;
const getMyPreferences = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    let pref = await prisma_1.prisma.userPreference.findUnique({ where: { userId } });
    if (!pref) {
        pref = await prisma_1.prisma.userPreference.create({
            data: { userId },
        });
    }
    res.json({ success: true, data: pref });
};
exports.getMyPreferences = getMyPreferences;
const updateMyPreferences = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { streamingQuality, downloadQuality, musicLanguages, autoPlay, showLyrics } = req.body;
    const pref = await prisma_1.prisma.userPreference.upsert({
        where: { userId },
        create: {
            userId,
            ...(streamingQuality !== undefined && { streamingQuality }),
            ...(downloadQuality !== undefined && { downloadQuality }),
            ...(musicLanguages !== undefined && { musicLanguages }),
            ...(autoPlay !== undefined && { autoPlay }),
            ...(showLyrics !== undefined && { showLyrics }),
        },
        update: {
            ...(streamingQuality !== undefined && { streamingQuality }),
            ...(downloadQuality !== undefined && { downloadQuality }),
            ...(musicLanguages !== undefined && { musicLanguages }),
            ...(autoPlay !== undefined && { autoPlay }),
            ...(showLyrics !== undefined && { showLyrics }),
        },
    });
    res.json({ success: true, data: pref });
};
exports.updateMyPreferences = updateMyPreferences;
//# sourceMappingURL=userService.js.map