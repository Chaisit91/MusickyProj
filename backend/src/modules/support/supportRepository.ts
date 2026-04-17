import { prisma } from "../../lib/prisma";
import { TicketStatus } from "@prisma/client";

export const createTicket = async (data: {
  userId: string;
  subject: string;
  description: string;
  contactEmail?: string;
}) => {
  return prisma.supportTicket.create({
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

export const getMyTickets = async (userId: string) => {
  return prisma.supportTicket.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
};

export const getTicketById = async (id: string, userId?: string) => {
  return prisma.supportTicket.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

export const addUserMessage = async (ticketId: string, content: string) => {
  const [msg] = await prisma.$transaction([
    prisma.supportMessage.create({ data: { ticketId, sender: "USER", content } }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date(), status: "OPEN" },
    }),
  ]);
  return msg;
};

// ── Admin ──────────────────────────────────────────────────────────────────────
export const getAllTickets = async (status?: TicketStatus) => {
  return prisma.supportTicket.findMany({
    where: status ? { status } : undefined,
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const adminReply = async (ticketId: string, content: string) => {
  const [msg] = await prisma.$transaction([
    prisma.supportMessage.create({ data: { ticketId, sender: "ADMIN", content } }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    }),
  ]);
  return msg;
};

export const updateTicketStatus = async (id: string, status: TicketStatus) => {
  return prisma.supportTicket.update({ where: { id }, data: { status } });
};
