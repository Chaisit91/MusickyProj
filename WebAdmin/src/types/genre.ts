// TypeScript types สำหรับ Genre — id, name, iconUrl
//
// หลักการทำงาน:
// 1. export interface Genre: id, name, color, imageUrl
// 2. export interface GenreFormData สำหรับ form create/update

export interface Genre {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenreCreateInput {
  name: string;
}

export interface GenreUpdateInput {
  name?: string;
}