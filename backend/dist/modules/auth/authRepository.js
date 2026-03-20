"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpiredTokens = exports.deleteAllRefreshTokensByUser = exports.deleteRefreshToken = exports.findRefreshToken = exports.saveRefreshToken = exports.updateLastLogin = exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
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