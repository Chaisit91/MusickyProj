import type { User } from "./user";
import type { Song } from "./song";

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  createdAt: string;
  song?: Song;
}

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  playlistSongs?: PlaylistSong[];
}

export interface PlaylistCreateInput {
  name: string;
}

export interface PlaylistUpdateInput {
  name?: string;
}