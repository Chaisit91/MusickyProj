import { useState, useEffect } from "react";
import { getDashboardApi } from "../api/dashboardApi";

interface DashboardStats {
  totalUsers: number;
  totalSongs: number;
  totalPlays: number;
  totalArtists: number;
  totalPremium: number;
  monthlyRevenue: number;
  conversionRate: string;
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
}

interface TopSong {
  id: string;
  title: string;
  playCount: number;
  artist: { name: string };
  album: { title: string };
  genre: { name: string };
}

interface UserGrowth {
  label: string;
  count: number;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [playGrowth, setPlayGrowth] = useState<UserGrowth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardApi();
      setStats(res.data.data.stats);
      setActivities(res.data.data.activities);
      setTopSongs(res.data.data.topSongs);
      setUserGrowth(res.data.data.userGrowth);
      setPlayGrowth(res.data.data.playGrowth ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { stats, activities, topSongs, userGrowth, playGrowth, loading, error, refetch: fetchDashboard };
};