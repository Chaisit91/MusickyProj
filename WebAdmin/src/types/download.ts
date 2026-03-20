import type { Song } from "./song";
import type { User } from "./user";

export interface Download {
  id: string;
  userId: string;
  songId: string;
  downloadedAt: string;
  user?: User;
  song?: Song;
}