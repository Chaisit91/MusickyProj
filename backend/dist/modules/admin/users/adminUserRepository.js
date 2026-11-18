"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.unbanUser = exports.banUser = exports.updateUser = exports.findUserById = exports.findAllUsers = void 0;
const prisma_1 = require("../../../lib/prisma");
const findAllUsers = async (search, status) => {
    return prisma_1.prisma.user.findMany({
        where: {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }),
            ...(status === "active" && { isActive: true }),
            ...(status === "banned" && { isActive: false }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            _count: {
                select: { playlists: true, likedSongs: true, downloads: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.findAllUsers = findAllUsers;
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            _count: {
                select: { playlists: true, likedSongs: true, downloads: true },
            },
        },
    });
};
exports.findUserById = findUserById;
const updateUser = async (id, data) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true,
        },
    });
};
exports.updateUser = updateUser;
const banUser = async (id) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { isActive: false },
    });
};
exports.banUser = banUser;
const unbanUser = async (id) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { isActive: true },
    });
};
exports.unbanUser = unbanUser;
const deleteUser = async (id) => {
    return prisma_1.prisma.user.delete({ where: { id } });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=adminUserRepository.js.map