import { useState, useEffect, useCallback } from "react";
import type { LikedSong } from "../types/liked-song";
import {
  getLikedSongsApi,
  likeSongApi,
  unlikeSongApi,
} from "../api/likedSongApi";

export const useLikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLikedSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLikedSongsApi();
      setLikedSongs(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch liked songs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedSongs();
  }, [fetchLikedSongs]);

  const likeSong = async (songId: string) => {
    await likeSongApi(songId);
    await fetchLikedSongs();
  };

  const unlikeSong = async (songId: string) => {
    await unlikeSongApi(songId);
    await fetchLikedSongs();
  };

  const isLiked = (songId: string) => {
    return likedSongs.some((ls) => ls.songId === songId);
  };

  return { likedSongs, loading, error, refetch: fetchLikedSongs, likeSong, unlikeSong, isLiked };
};
