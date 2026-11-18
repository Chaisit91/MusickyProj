import { prisma } from "../../lib/prisma";
import { NotificationType } from "@prisma/client";

export const findByUser = (userId: string) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

export const markRead = (id: string, userId: string) =>
  prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

export const markAllRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });

export const createNotification = (data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  amount?: string;
}) => prisma.notification.create({ data });
