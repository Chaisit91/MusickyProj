// TypeScript types สำหรับ Album — id, title, artistId, coverUrl, releaseDate, songCount
//
// หลักการทำงาน:
// 1. export interface Album: id, title, coverUrl, artistId, releaseYear, songs[]
// 2. export interface AlbumFormData: fields ที่ form ส่งไป API
// 3. ใช้โดย useAlbums hook และ AlbumManagement component

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