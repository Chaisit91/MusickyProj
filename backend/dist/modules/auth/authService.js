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
exports.getMe = exports.updateProfile = exports.googleLogin = exports.logoutAll = exports.logout = exports.refresh = exports.adminLogin = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const AuthRepository = __importStar(require("./authRepository"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const uploadImage_1 = require("../../utils/uploadImage");
// ── Cookie config ที่ใช้ซ้ำทุกที่ ให้ path ตรงกันเสมอ ──────────
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    path: "/",
};
const REFRESH_COOKIE_CLEAR_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
};
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
    // Auto-login after register — return tokens so client doesn't need an extra round-trip
    const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role, email: user.email });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, role: user.role, email: user.email });
    await AuthRepository.saveRefreshToken(user.id, refreshToken);
    res.status(201).json({
        success: true,
        message: "Register successful",
        data: {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: null,
                isPremium: false,
                premiumExpiresAt: null,
            },
        },
    });
};
exports.register = register;
const login = async (req, res) => {
    var _a, _b, _c;
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
    // ── ตรวจสอบ Premium หมดอายุตอน login ────────────────────────
    if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("../../lib/prisma")));
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isPremium: false, premiumExpiresAt: null },
        });
        user.isPremium = updated.isPremium;
        user.premiumExpiresAt = updated.premiumExpiresAt;
    }
    const accessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role, email: user.email });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, role: user.role, email: user.email });
    await AuthRepository.saveRefreshToken(user.id, refreshToken);
    res.json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: (_a = user.avatarUrl) !== null && _a !== void 0 ? _a : null,
                isPremium: (_b = user.isPremium) !== null && _b !== void 0 ? _b : false,
                premiumExpiresAt: (_c = user.premiumExpiresAt) !== null && _c !== void 0 ? _c : null,
            },
        },
    });
};
exports.login = login;
// ── OTP store (in-memory, expires 5 min) ─────────────────────
const otpStore = new Map();
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!(email === null || email === void 0 ? void 0 : email.trim())) {
        res.status(400).json({ success: false, message: "email is required" });
        return;
    }
    const user = await AuthRepository.findUserByEmail(email.toLowerCase());
    // ไม่บอกว่า email มีอยู่หรือไม่ (security)
    if (!user) {
        res.json({ success: true, message: "If the email exists, a reset code has been sent." });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(user.email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    // Production: ส่ง OTP ทาง email
    // Demo: ส่งกลับใน response ให้ user เห็น
    res.json({
        success: true,
        message: "Reset code generated",
        data: { otp }, // remove in production
    });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!(email === null || email === void 0 ? void 0 : email.trim()) || !(otp === null || otp === void 0 ? void 0 : otp.trim()) || !(newPassword === null || newPassword === void 0 ? void 0 : newPassword.trim())) {
        res.status(400).json({ success: false, message: "email, otp and newPassword are required" });
        return;
    }
    const emailLower = email.toLowerCase();
    const entry = otpStore.get(emailLower);
    if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) {
        res.status(400).json({ success: false, message: "Invalid or expired reset code" });
        return;
    }
    if (newPassword.length < 8) {
        res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        return;
    }
    const hashedPassword = await (0, password_1.hashPassword)(newPassword);
    await (await Promise.resolve().then(() => __importStar(require("../../lib/prisma")))).prisma.user.update({
        where: { email: emailLower },
        data: { password: hashedPassword },
    });
    otpStore.delete(emailLower);
    res.json({ success: true, message: "Password reset successfully" });
};
exports.resetPassword = resetPassword;
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
    //  refreshToken → HttpOnly Cookie (JS อ่านไม่ได้)
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    //  ส่งแค่ accessToken + user ใน body (ไม่ส่ง refreshToken)
    res.json({
        success: true,
        data: {
            accessToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
    });
};
exports.adminLogin = adminLogin;
const refresh = async (req, res) => {
    var _a, _b, _c;
    // WebAdmin ส่งผ่าน Cookie, mobile app ส่งผ่าน body
    const refreshToken = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) !== null && _b !== void 0 ? _b : (_c = req.body) === null || _c === void 0 ? void 0 : _c.refreshToken;
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
        //  clear cookie ถ้า token หมดอายุ
        res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
        res.status(401).json({ success: false, message: "Refresh token expired, please login again" });
        return;
    }
    if (!tokenRecord.user.isActive) {
        res.status(403).json({ success: false, message: "Account is disabled" });
        return;
    }
    //  Refresh Token Rotation — ลบเก่า ออกใหม่
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
    //  set refreshToken ใหม่ใน Cookie (Rotation)
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
    //  ส่งแค่ accessToken กลับ
    res.json({
        success: true,
        data: { accessToken: newAccessToken },
    });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    var _a;
    const userId = req.user.id;
    //  อ่าน refreshToken จาก Cookie
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (refreshToken) {
        //  ลบ token นี้ออกจาก DB
        await AuthRepository.deleteRefreshToken(refreshToken);
    }
    else {
        // ไม่มี cookie  ลบทั้งหมดของ user นี้
        await AuthRepository.deleteAllRefreshTokensByUser(userId);
    }
    //  clear cookie ออกจาก browser ทันที → refreshToken หายไปเลย
    res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
    res.json({ success: true, message: "Logged out successfully" });
};
exports.logout = logout;
const logoutAll = async (req, res) => {
    const userId = req.user.id;
    //  ลบ refreshToken ทุกอันของ user นี้ออกจาก DB
    await AuthRepository.deleteAllRefreshTokensByUser(userId);
    //  clear cookie บน browser ที่กำลังใช้งานอยู่
    res.clearCookie("refreshToken", REFRESH_COOKIE_CLEAR_OPTIONS);
    res.json({ success: true, message: "Logged out from all devices" });
};
exports.logoutAll = logoutAll;
const googleLogin = async (req, res) => {
    var _a, _b, _c;
    const { accessToken, name } = req.body;
    if (!accessToken) {
        res.status(400).json({ success: false, message: "accessToken is required" });
        return;
    }
    // ── ดึงข้อมูล user จาก Google API ──────────────────────────────
    let googleProfile;
    try {
        const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!resp.ok) {
            res.status(401).json({ success: false, message: "Invalid Google access token" });
            return;
        }
        googleProfile = (await resp.json());
    }
    catch (_d) {
        res.status(500).json({ success: false, message: "Failed to verify Google token" });
        return;
    }
    const { sub: googleId, email, name: googleName, picture } = googleProfile;
    let user = null;
    // ── ค้นหา user ด้วย googleId ────────────────────────────────────
    const byGoogleId = await AuthRepository.findUserByGoogleId(googleId);
    if (byGoogleId) {
        user = { id: byGoogleId.id, name: byGoogleId.name, email: byGoogleId.email, role: byGoogleId.role, avatarUrl: (_a = byGoogleId.avatarUrl) !== null && _a !== void 0 ? _a : null };
    }
    // ── ค้นหา user ด้วย email (กรณีสมัครด้วย email/password มาก่อน) ──
    if (!user) {
        const emailUser = await AuthRepository.findUserByEmail(email);
        if (emailUser) {
            const linked = await AuthRepository.linkGoogleId(emailUser.id, googleId, picture);
            user = { id: linked.id, name: linked.name, email: linked.email, role: linked.role, avatarUrl: (_b = linked.avatarUrl) !== null && _b !== void 0 ? _b : null };
        }
    }
    // ── ถ้ายังไม่มี user → ต้องตั้งชื่อก่อน ─────────────────────────
    if (!user) {
        if (!name || !name.trim()) {
            res.json({
                success: true,
                requiresName: true,
                googleData: {
                    googleId,
                    email,
                    suggestedName: googleName,
                    avatarUrl: picture !== null && picture !== void 0 ? picture : null,
                    accessToken,
                },
            });
            return;
        }
        const created = await AuthRepository.createGoogleUser({
            name: name.trim(),
            email,
            googleId,
            avatarUrl: picture,
        });
        user = { id: created.id, name: created.name, email: created.email, role: created.role, avatarUrl: (_c = created.avatarUrl) !== null && _c !== void 0 ? _c : null };
    }
    // ── ออก tokens ──────────────────────────────────────────────────
    await AuthRepository.updateLastLogin(user.id);
    const newAccessToken = (0, jwt_1.generateAccessToken)({ id: user.id, role: user.role, email: user.email });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, role: user.role, email: user.email });
    await AuthRepository.saveRefreshToken(user.id, refreshToken);
    res.json({
        success: true,
        requiresName: false,
        data: {
            accessToken: newAccessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
        },
    });
};
exports.googleLogin = googleLogin;
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    const current = await AuthRepository.findUserById(userId);
    if (!current) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    let avatarUrl;
    if (req.file) {
        // ลบรูปเก่าออกก่อน (ถ้ามี)
        if (current.avatarUrl) {
            await (0, uploadImage_1.deleteImageFromCloudinary)(current.avatarUrl);
        }
        avatarUrl = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, "avatars");
    }
    const updated = await AuthRepository.updateUserProfile(userId, {
        ...(name ? { name: name } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
    });
    res.json({ success: true, data: updated });
};
exports.updateProfile = updateProfile;
const getMe = async (req, res) => {
    var _a, _b, _c;
    const userId = req.user.id;
    let user = await AuthRepository.findUserById(userId);
    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    // ── ตรวจสอบ Premium หมดอายุ ──────────────────────────────────
    if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("../../lib/prisma")));
        user = await prisma.user.update({
            where: { id: userId },
            data: { isPremium: false, premiumExpiresAt: null },
        });
        // แจ้งเตือนว่า premium หมดอายุ
        const { createNotification } = await Promise.resolve().then(() => __importStar(require("../notification/notificationRepository")));
        await createNotification({
            userId,
            type: "PREMIUM_EXPIRING",
            title: "แพ็กเกจ Premium หมดอายุแล้ว",
            body: "แพ็กเกจ Premium ของคุณหมดอายุแล้ว สมัครใหม่เพื่อใช้งานต่อได้เลย",
        });
    }
    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: (_a = user.avatarUrl) !== null && _a !== void 0 ? _a : null,
            isPremium: (_b = user.isPremium) !== null && _b !== void 0 ? _b : false,
            premiumExpiresAt: (_c = user.premiumExpiresAt) !== null && _c !== void 0 ? _c : null,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        },
    });
};
exports.getMe = getMe;
//# sourceMappingURL=authService.js.map