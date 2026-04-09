import apiClient from "./apiClient";

export interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
}

export interface Genre {
  id: string;
  name: string;
  color: string | null;
  imageUrl: string | null;
}

export interface Song {
  id: string;
  title: string;
  duration: number | null;
  playCount: number;
  filePath: string;
  coverUrl: string | null;
  lyrics: string | null;
  artist: Artist;
  album: Album;
  genre: Genre;
}

export interface PlayHistoryItem {
  id: string;
  playedAt: string;
  song: Song;
}

export const getFeaturingSongs = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs/trending", { params: { limit: 10 } });
  return data.data as Song[];
};

export const getRecentlyPlayed = async (limit = 5): Promise<PlayHistoryItem[]> => {
  const { data } = await apiClient.get("/play-history", { params: { limit } });
  return data.data as PlayHistoryItem[];
};

export const getAllPlayHistory = async (): Promise<PlayHistoryItem[]> => {
  const { data } = await apiClient.get("/play-history");
  return data.data as PlayHistoryItem[];
};

export const recordPlay = async (songId: string): Promise<void> => {
  if (!songId) return;
  await apiClient.post("/play-history", { songId });
};

export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/genres");
  return data.data as Genre[];
};

export const getSongsByGenre = async (genreId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", { params: { genreId } });
  return (data.data as Song[]).slice(0, 3);
};

export const deleteHistoryRecord = async (id: string): Promise<void> => {
  await apiClient.delete(`/play-history/${id}`);
};

export const deleteAllHistory = async (): Promise<void> => {
  await apiClient.delete("/play-history/clear-all");
};

export const getNewReleases = async (limit = 8): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", { params: { limit } });
  return (data.data as Song[]).slice(0, limit);
};

export const getAllArtists = async (): Promise<Artist[]> => {
  const { data } = await apiClient.get("/artists");
  return data.data as Artist[];
};

// ─── Artist Follow API ────────────────────────────────────────────────────────

export const getFollowedArtistsApi = async (): Promise<Artist[]> => {
  const { data } = await apiClient.get("/artist-follows");
  return data.data as Artist[];
};

export const followArtistApi = async (artistId: string): Promise<void> => {
  await apiClient.post("/artist-follows", { artistId });
};

export const unfollowArtistApi = async (artistId: string): Promise<void> => {
  await apiClient.delete(`/artist-follows/${artistId}`);
};

// ─── Liked Songs API ──────────────────────────────────────────────────────────

export const getLikedSongsApi = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/liked-songs");
  return (data.data as { song: Song }[]).map((item) => item.song);
};

export const likeSongApi = async (songId: string): Promise<void> => {
  await apiClient.post("/liked-songs", { songId });
};

export const unlikeSongApi = async (songId: string): Promise<void> => {
  await apiClient.delete(`/liked-songs/${songId}`);
};

// ─── Downloads API ────────────────────────────────────────────────────────────

export const getDownloadsApi = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/downloads");
  return (data.data as { song: Song }[]).map((item) => item.song);
};

export const addDownloadApi = async (songId: string): Promise<void> => {
  await apiClient.post("/downloads", { songId });
};

export const removeDownloadApi = async (songId: string): Promise<void> => {
  await apiClient.delete(`/downloads/song/${songId}`);
};
