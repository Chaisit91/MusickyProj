export interface PlaylistCreateInput {
  name: string;
  userId: string;
}

export interface PlaylistUpdateInput {
  name?: string;
}

export interface PlaylistSongInput {
  songId: string;
  position?: number;
}
