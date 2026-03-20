import { useState, useCallback } from "react";
import type { SearchHistory } from "../types/search-history";
import type { Song } from "../types/song";
import type { Artist } from "../types/artist";
import type { Album } from "../types/album";
import {
  searchApi,
  getSearchHistoryApi,
  clearSearchHistoryApi,
} from "../api/searchApi";

interface SearchResult {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchApi(q);
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getSearchHistoryApi();
      setHistory(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch history");
    }
  }, []);

  const clearHistory = async () => {
    await clearSearchHistoryApi();
    setHistory([]);
  };

  return { results, history, loading, error, search, fetchHistory, clearHistory };
};
