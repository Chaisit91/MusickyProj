import type { Artist } from "./artist";

export interface AlbumSong {
  id: string;
  title: string;
  duration?: number;
  playCount: number;
  coverUrl?: string;
  filePath?: string;
  genre?: { id: string; name: string };
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  releaseDate: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
  artist?: Artist;
  songs?: AlbumSong[];
}

export interface AlbumCreateInput {
  title: string;
  artistId: string;
  releaseDate: string;
  coverUrl?: string;
}

export interface AlbumUpdateInput {
  title?: string;
  artistId?: string;
  releaseDate?: string;
  coverUrl?: string;
}