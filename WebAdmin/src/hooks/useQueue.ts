import { useState, useEffect, useCallback } from "react";
import type { Queue } from "../types/queue";
import {
  getQueueApi,
  addToQueueApi,
  removeFromQueueApi,
  reorderQueueApi,
  clearQueueApi,
} from "../api/queueApi";

export const useQueue = () => {
  const [queue, setQueue] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQueueApi();
      setQueue(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const addToQueue = async (songId: string) => {
    await addToQueueApi(songId);
    await fetchQueue();
  };

  const removeFromQueue = async (id: string) => {
    await removeFromQueueApi(id);
    await fetchQueue();
  };

  const reorderQueue = async (orderedIds: string[]) => {
    await reorderQueueApi(orderedIds);
    await fetchQueue();
  };

  const clearQueue = async () => {
    await clearQueueApi();
    await fetchQueue();
  };

  return { queue, loading, error, refetch: fetchQueue, addToQueue, removeFromQueue, reorderQueue, clearQueue };
};
