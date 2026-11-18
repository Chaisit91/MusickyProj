import { Request, Response } from "express";
import * as NotificationRepository from "./notificationRepository";

export const getMyNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string;
  const notifications = await NotificationRepository.findByUser(userId);
  res.json({ success: true, data: notifications });
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string;
  const id = req.params.id as string;
  await NotificationRepository.markRead(id, userId);
  res.json({ success: true });
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string;
  await NotificationRepository.markAllRead(userId);
  res.json({ success: true });
};
