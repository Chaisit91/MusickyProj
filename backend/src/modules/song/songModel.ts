export interface SongCreateInput {
  title: string;
  artistId: string;
  albumId: string;
  genreId: string;
  filePath: string;
  coverUrl?: string;
  duration?: number;
  year?: number;
  lyrics?: string;
  language?: string;
}

export interface SongUpdateInput {
  title?: string;
  artistId?: string;
  albumId?: string;
  genreId?: string;
  filePath?: string;
  coverUrl?: string;
  duration?: number;
  year?: number;
  lyrics?: string;
  language?: string;
}

export interface SongFilterInput {
  artistId?: string;
  albumId?: string;
  genreId?: string;
  search?: string;
  languages?: string[];
}
