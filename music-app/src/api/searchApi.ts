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

// ─── Search by title + artist (parallel calls + client-side filter) ───────────

export const searchAll = async (query: string): Promise<SearchResult> => {
  const q = query.normalize("NFC").trim();
  const lower = q.toLowerCase();

  // Two parallel calls: one searching by title, one by artist name
  const [byTitle, byArtist] = await Promise.allSettled([
    apiClient.get("/songs", { params: { search: q, limit: 30 }, paramsSerializer: serialize }),
    apiClient.get("/songs", { params: { artist: q, limit: 20 }, paramsSerializer: serialize }),
  ]);

  // Merge & deduplicate
  const seen = new Set<string>();
  const allSongs: Song[] = [];

  for (const res of [byTitle, byArtist]) {
    if (res.status === "fulfilled") {
      const songs = (res.value.data.data ?? []) as Song[];
      for (const song of songs) {
        if (!seen.has(song.id)) {
          seen.add(song.id);
          allSongs.push(song);
        }
      }
    }
  }

  // Client-side filter: keep songs whose title OR artist name includes the query
  const matchedSongs = allSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(lower) ||
      s.artist.name.toLowerCase().includes(lower)
  );

  // Extract unique artists that match the query
  const artistMap = new Map<string, Artist>();
  matchedSongs.forEach((s) => {
    if (s.artist.name.toLowerCase().includes(lower)) {
      artistMap.set(s.artist.id, s.artist);
    }
  });

  return { songs: matchedSongs, artists: Array.from(artistMap.values()) };
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
