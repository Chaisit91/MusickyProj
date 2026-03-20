import type { Artist } from "./artist";

export interface Album {
  id: string;
  title: string;
  artistId: string;
  releaseDate: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
  artist?: Artist;
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