import { useState, useEffect, useCallback } from "react";
import type { Playlist } from "../types/playlist";
import {
  getAllPlaylistsApi,
  createPlaylistApi,
  updatePlaylistApi,
  deletePlaylistApi,
  addSongToPlaylistApi,
  removeSongFromPlaylistApi,
} from "../api/playlistApi";

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPlaylistsApi();
      setPlaylists(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch playlists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (name: string) => {
    await createPlaylistApi({ name });
    await fetchPlaylists();
  };

  const updatePlaylist = async (id: string, name: string) => {
    await updatePlaylistApi(id, { name });
    await fetchPlaylists();
  };

  const deletePlaylist = async (id: string) => {
    await deletePlaylistApi(id);
    await fetchPlaylists();
  };

  const addSong = async (playlistId: string, songId: string) => {
    await addSongToPlaylistApi(playlistId, songId);
    await fetchPlaylists();
  };

  const removeSong = async (playlistId: string, songId: string) => {
    await removeSongFromPlaylistApi(playlistId, songId);
    await fetchPlaylists();
  };

  return { playlists, loading, error, refetch: fetchPlaylists, createPlaylist, updatePlaylist, deletePlaylist, addSong, removeSong };
};
