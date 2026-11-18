"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderQueue = exports.clearQueue = exports.removeFromQueue = exports.addToQueue = exports.getNextQueuePosition = exports.findQueueItemById = exports.findQueueByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const findQueueByUser = async (userId) => {
    return prisma_1.prisma.queue.findMany({
        where: { userId },
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
        orderBy: { position: "asc" },
    });
};
exports.findQueueByUser = findQueueByUser;
const findQueueItemById = async (id) => {
    return prisma_1.prisma.queue.findUnique({ where: { id } });
};
exports.findQueueItemById = findQueueItemById;
const getNextQueuePosition = async (userId) => {
    const last = await prisma_1.prisma.queue.findFirst({
        where: { userId },
        orderBy: { position: "desc" },
    });
    return last ? last.position + 1 : 1;
};
exports.getNextQueuePosition = getNextQueuePosition;
const addToQueue = async (data, position) => {
    return prisma_1.prisma.queue.create({
        data: { ...data, position },
        include: {
            song: {
                include: { artist: true, album: true, genre: true },
            },
        },
    });
};
exports.addToQueue = addToQueue;
const removeFromQueue = async (id) => {
    return prisma_1.prisma.queue.delete({ where: { id } });
};
exports.removeFromQueue = removeFromQueue;
const clearQueue = async (userId) => {
    return prisma_1.prisma.queue.deleteMany({ where: { userId } });
};
exports.clearQueue = clearQueue;
const reorderQueue = async (userId, orderedIds) => {
    // อัปเดต position ทีละ item ตามลำดับใหม่
    const updates = orderedIds.map((id, index) => prisma_1.prisma.queue.update({
        where: { id },
        data: { position: index + 1 },
    }));
    return prisma_1.prisma.$transaction(updates);
};
exports.reorderQueue = reorderQueue;
//# sourceMappingURL=queueRepository.js.map