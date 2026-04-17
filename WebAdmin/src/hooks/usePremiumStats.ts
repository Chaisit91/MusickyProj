import { useEffect, useState, useCallback } from "react";
import { getUserStatsApi } from "../api/userApi";

export interface PremiumStats {
  total: number;
  premium: number;
  active: number;
  banned: number;
  free: number;
}

export const usePremiumStats = () => {
  const [stats, setStats] = useState<PremiumStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getUserStatsApi();
      setStats(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, refetch: fetchStats };
};
