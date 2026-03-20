import { useState, useEffect, useCallback } from "react";
import type { Download } from "../types/download";
import {
  getDownloadsApi,
  addDownloadApi,
  removeDownloadApi,
  clearDownloadsApi,
} from "../api/downloadApi";

export const useDownloads = () => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDownloads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDownloadsApi();
      setDownloads(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch downloads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const addDownload = async (songId: string) => {
    await addDownloadApi(songId);
    await fetchDownloads();
  };

  const removeDownload = async (id: string) => {
    await removeDownloadApi(id);
    await fetchDownloads();
  };

  const clearDownloads = async () => {
    await clearDownloadsApi();
    await fetchDownloads();
  };

  return { downloads, loading, error, refetch: fetchDownloads, addDownload, removeDownload, clearDownloads };
};
