import type { User } from "./user";

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  searchedAt: string;
  user?: User;
}

export interface SearchResult {
  songs: import("./song").Song[];
  artists: import("./artist").Artist[];
  albums: import("./album").Album[];
}