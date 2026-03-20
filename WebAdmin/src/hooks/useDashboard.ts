import { useState, useEffect } from "react";
import { getDashboardApi } from "../api/dashboardApi";

interface DashboardStats {
  totalUsers: number;
  totalSongs: number;
  totalPlays: number;
  totalArtists: number;
}

interface Activity {
  type: string;
  message: string;
  createdAt: string;
}

interface TopSong {
  id: string;
  title: string;
  playCount: number;
  artist: { name: string };
  album: { title: string };
  genre: { name: string };
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { stats, activities, topSongs, loading, error, refetch: fetchDashboard };
};
