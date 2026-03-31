import type { Artist } from "./artist";
import type { Album } from "./album";
import type { Genre } from "./genre";

export interface Song {
  id: string;
  title: string;
  artistId: string;
  albumId: string;
  genreId: string;
  filePath: string;
  coverUrl?: string;
  duration?: number;
  playCount: number;
  year?: number;
  lyrics?: string;
  createdAt: string;
  updatedAt: string;
  artist?: Artist;
  album?: Album;
  genre?: Genre;
}

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