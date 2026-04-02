import { useState, useEffect, useCallback } from "react";
import {
  getAdsStatsApi,
  getAllAdsApi,
  createAdsApi,
  updateAdsApi,
  toggleAdsApi,
  deleteAdsApi,
} from "../api/adsApi";

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  adType: string;
  adDuration: number;
  advertiser: string;
  impressions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdsStats {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
}

export const useAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adsRes, statsRes] = await Promise.all([
        getAllAdsApi(),
        getAdsStatsApi(),
      ]);
      setAds(adsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const createAds = async (data: {
    title: string;
    adType: string;
    adDuration: number;
    advertiser: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    mediaFile: File;
  }) => {
    await createAdsApi(data);
    await fetchAds();
  };

  const updateAds = async (id: string, data: {
    title?: string;
    adType?: string;
    adDuration?: number;
    advertiser?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    mediaFile?: File;
  }) => {
    await updateAdsApi(id, data);
    await fetchAds();
  };

  const toggleAds = async (id: string) => {
    await toggleAdsApi(id);
    await fetchAds();
  };

  const deleteAds = async (id: string) => {
    await deleteAdsApi(id);
    await fetchAds();
  };

  return { ads, stats, loading, error, refetch: fetchAds, createAds, updateAds, toggleAds, deleteAds };
};
