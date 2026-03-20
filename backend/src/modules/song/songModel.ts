export interface SongCreateInput {
  title: string;
  artistId: string;
  albumId: string;
  genreId: string;
  filePath: string;
  duration?: number;
  year?: number;
  lyrics?: string;
}

export interface SongUpdateInput {
  title?: string;
  artistId?: string;
  albumId?: string;
  genreId?: string;
  filePath?: string;
  duration?: number;
  year?: number;
  lyrics?: string;
}

export interface SongFilterInput {
  artistId?: string;
  albumId?: string;
  genreId?: string;
  search?: string;
}
