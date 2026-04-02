// ─── Re-exported shared types from API modules ───────────────────────────────
//
// Import from here for convenience; the canonical definitions live in the
// api files so existing imports continue to work without change.

export type { Artist, Album, Genre, Song, PlayHistoryItem } from "../api/homeApi";
export type { SearchResult } from "../api/searchApi";
