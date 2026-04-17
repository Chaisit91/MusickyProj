"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.adminReply = exports.getAllTickets = exports.addUserMessage = exports.getTicketById = exports.getMyTickets = exports.createTicket = void 0;
const prisma_1 = require("../../lib/prisma");
const createTicket = async (data) => {
    return prisma_1.prisma.supportTicket.create({
        data: {
            userId: data.userId,
            subject: data.subject,
            description: data.description,
            ...(data.contactEmail ? { contactEmail: data.contactEmail } : {}),
            messages: {
                create: { sender: "USER", content: data.description },
            },
        },
        include: { messages: true },
    });
};
exports.createTicket = createTicket;
const getMyTickets = async (userId) => {
    return prisma_1.prisma.supportTicket.findMany({
        where: { userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { updatedAt: "desc" },
    });
};
exports.getMyTickets = getMyTickets;
const getTicketById = async (id, userId) => {
    return prisma_1.prisma.supportTicket.findFirst({
        where: { id, ...(userId ? { userId } : {}) },
        include: {
            messages: { orderBy: { createdAt: "asc" } },
            user: { select: { id: true, name: true, email: true } },
        },
    });
};
exports.getTicketById = getTicketById;
const addUserMessage = async (ticketId, content) => {
    const [msg] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.supportMessage.create({ data: { ticketId, sender: "USER", content } }),
        prisma_1.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date(), status: "OPEN" },
        }),
    ]);
    return msg;
};
exports.addUserMessage = addUserMessage;
// ── Admin ──────────────────────────────────────────────────────────────────────
const getAllTickets = async (status) => {
    return prisma_1.prisma.supportTicket.findMany({
        where: status ? { status } : undefined,
        include: {
            messages: { orderBy: { createdAt: "asc" } },
            user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
    });
};
exports.getAllTickets = getAllTickets;
const adminReply = async (ticketId, content) => {
    const [msg] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.supportMessage.create({ data: { ticketId, sender: "ADMIN", content } }),
        prisma_1.prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: "IN_PROGRESS", updatedAt: new Date() },
        }),
    ]);
    return msg;
};
exports.adminReply = adminReply;
const updateTicketStatus = async (id, status) => {
    return prisma_1.prisma.supportTicket.update({ where: { id }, data: { status } });
};
exports.updateTicketStatus = updateTicketStatus;
//# sourceMappingURL=supportRepository.js.map