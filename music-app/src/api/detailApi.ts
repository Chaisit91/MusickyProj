import apiClient from "./apiClient";
import { Song } from "./homeApi";

// ─── Songs by artist ──────────────────────────────────────────────────────────

export const getArtistSongs = async (artistId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", {
    params: { artistId, limit: 50 },
  });
  return data.data as Song[];
};

// ─── Songs by album ───────────────────────────────────────────────────────────

export const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", {
    params: { albumId, limit: 50 },
  });
  return data.data as Song[];
};

// ─── Songs by genre ───────────────────────────────────────────────────────────

export const getGenreSongs = async (genreId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", {
    params: { genreId, limit: 50 },
  });
  return data.data as Song[];
};
