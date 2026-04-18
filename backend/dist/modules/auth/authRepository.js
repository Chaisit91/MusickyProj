"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpiredTokens = exports.deleteAllRefreshTokensByUser = exports.deleteRefreshToken = exports.findRefreshToken = exports.saveRefreshToken = exports.updateUserProfile = exports.linkGoogleId = exports.createGoogleUser = exports.findUserByGoogleId = exports.updateLastLogin = exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
const prisma_1 = require("../../lib/prisma");
const findUserByEmail = async (email) => {
    return prisma_1.prisma.user.findUnique({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({ where: { id } });
};
exports.findUserById = findUserById;
const createUser = async (data) => {
    return prisma_1.prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: data.password,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};
exports.createUser = createUser;
const updateLastLogin = async (id) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { lastLogin: new Date() },
    });
};
exports.updateLastLogin = updateLastLogin;
const findUserByGoogleId = async (googleId) => {
    return prisma_1.prisma.user.findUnique({ where: { googleId } });
};
exports.findUserByGoogleId = findUserByGoogleId;
const createGoogleUser = async (data) => {
    // สร้าง random password สำหรับ Google user (ไม่ได้ใช้ login ด้วย email)
    const randomPass = Math.random().toString(36) + Math.random().toString(36);
    return prisma_1.prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: randomPass,
            googleId: data.googleId,
            avatarUrl: data.avatarUrl,
        },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true, googleId: true },
    });
};
exports.createGoogleUser = createGoogleUser;
const linkGoogleId = async (userId, googleId, avatarUrl) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { googleId, ...(avatarUrl ? { avatarUrl } : {}) },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });
};
exports.linkGoogleId = linkGoogleId;
const updateUserProfile = async (id, data) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, avatarUrl: true, isPremium: true, premiumExpiresAt: true },
    });
};
exports.updateUserProfile = updateUserProfile;
// ── RefreshToken table ─────────────────────────────────────────
const saveRefreshToken = async (userId, token) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // หมดอายุใน 7 วัน
    return prisma_1.prisma.refreshToken.create({
        data: { userId, token, expiresAt },
    });
};
exports.saveRefreshToken = saveRefreshToken;
const findRefreshToken = async (token) => {
    return prisma_1.prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
};
exports.findRefreshToken = findRefreshToken;
const deleteRefreshToken = async (token) => {
    return prisma_1.prisma.refreshToken.delete({ where: { token } });
};
exports.deleteRefreshToken = deleteRefreshToken;
const deleteAllRefreshTokensByUser = async (userId) => {
    return prisma_1.prisma.refreshToken.deleteMany({ where: { userId } });
};
exports.deleteAllRefreshTokensByUser = deleteAllRefreshTokensByUser;
const deleteExpiredTokens = async () => {
    return prisma_1.prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
    });
};
exports.deleteExpiredTokens = deleteExpiredTokens;
//# sourceMappingURL=authRepository.js.map