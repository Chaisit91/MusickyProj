import type { Song } from "./song";
import type { User } from "./user";

export interface LikedSong {
  id: string;
  userId: string;
  songId: string;
  createdAt: string;
  user?: User;
  song?: Song;
}