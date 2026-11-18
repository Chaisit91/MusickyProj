import apiClient from "./apiClient";
import { Artist, Song, Genre } from "./homeApi";

// ─── Shared serializer (handles Thai + special chars) ────────────────────────

const serialize = (params: Record<string, unknown>) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

// ─── Search result type ───────────────────────────────────────────────────────

export interface SearchResult {
  songs: Song[];
  artists: Artist[];
}

// ─── Search via backend /search?q= endpoint ──────────────────────────────────

export const searchAll = async (query: string): Promise<SearchResult> => {
  const q = query.normalize("NFC").trim();
  const lower = q.toLowerCase();

  const { data } = await apiClient.get("/search", {
    params: { q },
    paramsSerializer: serialize,
  });

  const songs = (data.data?.songs ?? []) as Song[];
  const artists = (data.data?.artists ?? []) as Artist[];

  // Include artists from matched songs that the backend may have missed
  const artistMap = new Map<string, Artist>(artists.map((a) => [a.id, a]));
  songs.forEach((s) => {
    if (s.artist.name.toLowerCase().includes(lower)) {
      artistMap.set(s.artist.id, s.artist);
    }
  });

  return { songs, artists: Array.from(artistMap.values()) };
};

// ─── Trending artists (extracted from trending songs) ─────────────────────────

export const getTrendingArtists = async (): Promise<Artist[]> => {
  const { data } = await apiClient.get("/songs/trending", {
    params: { limit: 20 },
  });
  const songs = data.data as Song[];
  const seen = new Set<string>();
  return songs
    .map((s) => s.artist)
    .filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .slice(0, 10);
};

// ─── Browse genres ────────────────────────────────────────────────────────────

export const getBrowseGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/genres");
  return data.data as Genre[];
};

// ─── AI lyrics search ─────────────────────────────────────────────────────────

export interface LyricsSearchResult extends SearchResult {
  aiUsed: true;
}

export const searchByLyrics = async (query: string): Promise<LyricsSearchResult> => {
  const q = query.normalize("NFC").trim();
  const { data } = await apiClient.get("/search/lyrics", {
    params: { q },
    paramsSerializer: serialize,
  });
  const songs = (data.data?.songs ?? []) as Song[];
  const artists = (data.data?.artists ?? []) as Artist[];
  return { songs, artists, aiUsed: true };
};

// ─── Search History Items (rich) ──────────────────────────────────────────────

export interface SearchHistoryItem {
  id: string;
  itemId: string;
  itemType: "song" | "artist" | "album" | "playlist";
  title: string;
  subtitle: string;
  coverUrl: string | null;
  searchedAt: string;
}

export const getSearchHistoryItemsApi = async (): Promise<SearchHistoryItem[]> => {
  const { data } = await apiClient.get("/search/history/items");
  return data.data as SearchHistoryItem[];
};

export const addSearchHistoryItemApi = async (item: {
  itemId: string;
  itemType: string;
  title: string;
  subtitle: string;
  coverUrl?: string | null;
}): Promise<void> => {
  await apiClient.post("/search/history/items", item);
};

export const removeSearchHistoryItemApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/search/history/items/${id}`);
};

export const clearSearchHistoryItemsApi = async (): Promise<void> => {
  await apiClient.delete("/search/history/items");
};
