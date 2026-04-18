"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.markAllRead = exports.markRead = exports.findByUser = void 0;
const prisma_1 = require("../../lib/prisma");
const findByUser = (userId) => prisma_1.prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
});
exports.findByUser = findByUser;
const markRead = (id, userId) => prisma_1.prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
});
exports.markRead = markRead;
const markAllRead = (userId) => prisma_1.prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
});
exports.markAllRead = markAllRead;
const createNotification = (data) => prisma_1.prisma.notification.create({ data });
exports.createNotification = createNotification;
//# sourceMappingURL=notificationRepository.js.map