import { Request, Response } from "express";
import * as DashboardRepository from "./dashboardRepository";

export const getDashboard = async (req: Request, res: Response) => {
  const [stats, activities, topSongs, userGrowth, playGrowth] = await Promise.all([
    DashboardRepository.getDashboardStats(),
    DashboardRepository.getRecentActivities(),
    DashboardRepository.getTopSongs(),
    DashboardRepository.getUserGrowth(),
    DashboardRepository.getPlayGrowth(),
  ]);
  res.json({ success: true, data: { stats, activities, topSongs, userGrowth, playGrowth } });
};