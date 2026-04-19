// Hook จัดการเพลง — fetch list (filter ตาม artistId ได้), create, update, delete | จัดการ loading/error state
//
// หลักการทำงาน:
// 1. fetchSongs: GET /songs (paginated) → โหลดเพลงพร้อม artist/album/genre
// 2. createSong: POST /songs (FormData: audio file + cover image + metadata)
// 3. updateSong: PUT /songs/:id (FormData)
// 4. deleteSong: DELETE /songs/:id
// 5. pagination + search filter state

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

export const useSongs = (search?: string, genreId?: string, artistId?: string) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [songsRes, statsRes] = await Promise.all([
        getAllSongsApi(search, genreId, artistId),
        getSongStatsApi(),
      ]);
      setSongs(songsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch songs");
    } finally {
      setLoading(false);
    }
  }, [search, genreId, artistId]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const createSong = async (formData: FormData) => {
    await createSongApi(formData);
    await fetchSongs();
  };

  const updateSong = async (id: string, formData: FormData) => {
    await updateSongApi(id, formData);
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
