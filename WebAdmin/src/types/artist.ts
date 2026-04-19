// TypeScript types สำหรับ Artist — id, name, bio, imageUrl, songCount
//
// หลักการทำงาน:
// 1. export interface Artist: id, name, imageUrl, bio, followerCount
// 2. export interface ArtistFormData: fields สำหรับ create/update

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistCreateInput {
  name: string;
  bio?: string;
  imageUrl?: string;
}

export interface ArtistUpdateInput {
  name?: string;
  bio?: string;
  imageUrl?: string;
}