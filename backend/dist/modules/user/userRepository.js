"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.unbanUser = exports.banUser = exports.findUserById = exports.findAllUsers = void 0;
const prisma_1 = require("../../lib/prisma");
const findAllUsers = async () => {
    return prisma_1.prisma.user.findMany({
        select: {
            id: true, name: true, email: true, role: true,
            isActive: true, createdAt: true, lastLogin: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.findAllUsers = findAllUsers;
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true, name: true, email: true, role: true,
            isActive: true, createdAt: true, lastLogin: true,
        },
    });
};
exports.findUserById = findUserById;
const banUser = async (id) => {
    return prisma_1.prisma.user.update({ where: { id }, data: { isActive: false } });
};
exports.banUser = banUser;
const unbanUser = async (id) => {
    return prisma_1.prisma.user.update({ where: { id }, data: { isActive: true } });
};
exports.unbanUser = unbanUser;
const deleteUser = async (id) => {
    return prisma_1.prisma.user.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userRepository.js.map