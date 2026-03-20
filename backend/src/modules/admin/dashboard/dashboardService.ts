import { Request, Response } from "express";
import * as DashboardRepository from "./dashboardRepository";

export const getDashboard = async (req: Request, res: Response) => {
  const [stats, activities, topSongs] = await Promise.all([
    DashboardRepository.getDashboardStats(),
    DashboardRepository.getRecentActivities(),
    DashboardRepository.getTopSongs(),
  ]);
  res.json({ success: true, data: { stats, activities, topSongs } });
};
