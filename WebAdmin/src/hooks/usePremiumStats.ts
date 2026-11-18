import { useEffect, useState } from "react";
import { store } from "../store/store";

export interface PremiumStats {
  total: number;
  premium: number;
  active: number;
  banned: number;
  free: number;
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const usePremiumStats = () => {
  const [stats, setStats] = useState<PremiumStats | null>(null);

  useEffect(() => {
    const token = store.getState().auth.accessToken;
    if (!token) return;

    const url = `${BASE_URL}/admin/users/stats/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        setStats(JSON.parse(e.data) as PremiumStats);
      } catch {
        // ignore malformed event
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, []);

  return stats;
};
