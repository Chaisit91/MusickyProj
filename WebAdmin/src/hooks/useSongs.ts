import { useState, useEffect, useCallback } from "react";
import type { Song } from "../types/song";
import {
  getSongStatsApi,
  getAllSongsApi,
  createSongApi,
  updateSongApi,
  deleteSongApi,
  playSongApi,
} from "../api/songApi";

interface SongStats {
  totalSongs: number;
  totalPlays: number;
  avgPlays: number;
}

export const useSongs = (search?: string, genreId?: string) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [songsRes, statsRes] = await Promise.all([
        getAllSongsApi(search, genreId),
        getSongStatsApi(),
      ]);
      setSongs(songsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch songs");
    } finally {
      setLoading(false);
    }
  }, [search, genreId]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const createSong = async (data: {
    title: string;
    artistId: string;
    albumId: string;
    genreId: string;
    filePath: string;
    duration?: number;
    year?: number;
    lyrics?: string;
  }) => {
    await createSongApi(data);
    await fetchSongs();
  };

  const updateSong = async (id: string, data: {
    title?: string;
    artistId?: string;
    albumId?: string;
    genreId?: string;
    filePath?: string;
    duration?: number;
    year?: number;
    lyrics?: string;
  }) => {
    await updateSongApi(id, data);
    await fetchSongs();
  };

  const deleteSong = async (id: string) => {
    await deleteSongApi(id);
    await fetchSongs();
  };

  const playSong = async (id: string) => {
    await playSongApi(id);
    await fetchSongs();
  };

  return { songs, stats, loading, error, refetch: fetchSongs, createSong, updateSong, deleteSong, playSong };
};
