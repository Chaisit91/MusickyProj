import type { Song } from "./song";
import type { User } from "./user";

export interface Queue {
  id: string;
  userId: string;
  songId: string;
  position: number;
  queuedAt: string;
  user?: User;
  song?: Song;
}

export interface QueueReorderInput {
  orderedIds: string[];
}