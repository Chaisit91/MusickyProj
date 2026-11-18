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
exports.getMe = exports.logoutAll = exports.logout = exports.refresh = exports.adminLogin = exports.login = exports.register = void 0;
const AuthRepository = __importStar(require("./authRepository"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const register = async (req, res) => {
    const { name, email, password, birthDate } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ success: false, message: "name, email and password are required" });
        return;
    }
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith("@gmail.com")) {
        res.status(400).json({ success: false, message: "Only @gmail.com email is allowed" });
        return;
    }
    const existing = await AuthRepository.findUserByEmail(emailLower);
    if (existing) {
        res.status(409).json({ success: false, message: "Email already in use" });
        return;
    }
    const hashedPassword = await (0, password_1.hashPassword)(password);
    const user = await AuthRepository.createUser({
        name: name,
        email: emailLower,
        password: hashedPassword,
        birthDate: birthDate ? new Date(birthDate) : undefined,
    });
    res.status(201).json({
        success: true,
        message: "Register successful, please login",
        data: { user },
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ success: false, message: "email and password are required" });
        return;
    }
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith("@gmail.com")) {
        res.status(400).json({ success: false, message: "Only @gmail.com email is allowed" });
        return;
    }
    const user = await AuthRepository.findUserByEmail(emailLower);
    if (!user) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
    }
    if (!user.isActive) {
        res.status(403).json({ success: false, message: "Account is disabled" });
        return;
    }
    const isMatch = await (0, password_1.comparePassword)(password, user.password);
    if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
    }
    await AuthRepository.updateLastLogin(user.id);
    const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role, email: user.email });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, role: user.role, email: user.email });
    await AuthRepository.saveRefreshToken(user.id, refreshToken);
    res.json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
    });
};
exports.login = login;
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ success: false, message: "email and password are required" });
        return;
    }
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith("@gmail.com")) {
        res.status(400).json({ success: false, message: "Only @gmail.com email is allowed" });
        return;
    }
    const user = await AuthRepository.findUserByEmail(emailLower);
    if (!user) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
    }
    if (user.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "Access denied: Admins only" });
        return;
    }
    if (!user.isActive) {
        res.status(403).json({ success: false, message: "Account is disabled" });
        return;
    }
    const isMatch = await (0, password_1.comparePassword)(password, user.password);
    if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
    }
    await AuthRepository.updateLastLogin(user.id);
    const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role, email: user.email });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, role: user.role, email: user.email });
    await AuthRepository.saveRefreshToken(user.id, refreshToken);
    res.json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
    });
};
exports.adminLogin = adminLogin;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ success: false, message: "refreshToken is required" });
        return;
    }
    const tokenRecord = await AuthRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
        res.status(401).json({ success: false, message: "Invalid refresh token" });
        return;
    }
    if (tokenRecord.expiresAt < new Date()) {
        await AuthRepository.deleteRefreshToken(refreshToken);
        res.status(401).json({ success: false, message: "Refresh token expired, please login again" });
        return;
    }
    if (!tokenRecord.user.isActive) {
        res.status(403).json({ success: false, message: "Account is disabled" });
        return;
    }
    // Refresh Token Rotation — ลบเก่า ออกใหม่
    await AuthRepository.deleteRefreshToken(refreshToken);
    const newAccessToken = (0, jwt_1.generateAccessToken)({
        id: tokenRecord.user.id,
        role: tokenRecord.user.role,
        email: tokenRecord.user.email,
    });
    const newRefreshToken = (0, jwt_1.generateRefreshToken)({
        id: tokenRecord.user.id,
        role: tokenRecord.user.role,
        email: tokenRecord.user.email,
    });
    await AuthRepository.saveRefreshToken(tokenRecord.user.id, newRefreshToken);
    res.json({
        success: true,
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        },
    });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const userId = req.user.id;
    const { refreshToken } = req.body;
    if (refreshToken) {
        await AuthRepository.deleteRefreshToken(refreshToken);
    }
    else {
        await AuthRepository.deleteAllRefreshTokensByUser(userId);
    }
    res.json({ success: true, message: "Logged out successfully" });
};
exports.logout = logout;
const logoutAll = async (req, res) => {
    const userId = req.user.id;
    await AuthRepository.deleteAllRefreshTokensByUser(userId);
    res.json({ success: true, message: "Logged out from all devices" });
};
exports.logoutAll = logoutAll;
const getMe = async (req, res) => {
    const userId = req.user.id;
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        },
    });
};
exports.getMe = getMe;
//# sourceMappingURL=authService.js.map