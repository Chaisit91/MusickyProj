// API ดึงรายละเอียด — อัลบั้ม [id], ศิลปิน [id] + เพลง, แนวเพลง [id] + เพลง, playlist [id] + เพลง
//
// หลักการทำงาน:
// 1. getArtistSongs(artistId): GET /songs?artistId=&limit=50 → เพลงของศิลปินคนนั้น
// 2. getAlbumSongs(albumId): GET /songs?albumId=&limit=50 → เพลงในอัลบั้มนั้น
// 3. getGenreSongs(genreId): GET /songs?genreId=&limit=50 → เพลงในแนวเพลงนั้น
// 4. ทุก function ใช้ query param filter ที่ endpoint เดียวกัน (/songs) ต่างกันแค่ parameter

// นำเข้า apiClient ที่ตั้งค่า interceptor และ base URL ไว้แล้ว
import apiClient from "./apiClient";
// นำเข้า type Song จาก homeApi เพื่อใช้เป็น return type
import { Song } from "./homeApi";

// ─── ดึงเพลงตามศิลปิน ────────────────────────────────────────────────────────
// ใช้แสดงในหน้า Artist Detail เพื่อดูเพลงทั้งหมดของศิลปินคนนั้น
// params: artistId - รหัสศิลปินที่ต้องการดูเพลง
// ดึงสูงสุด 50 เพลง เพื่อให้ครอบคลุม discography ของศิลปิน
// return: array ของ Song ที่เป็นของศิลปินนั้น
export const getArtistSongs = async (artistId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", {
    params: { artistId, limit: 50 }, // filter ด้วย artistId และจำกัด 50 เพลง
  });
  return data.data as Song[];
};

// ─── ดึงเพลงตามอัลบั้ม ───────────────────────────────────────────────────────
// ใช้แสดงในหน้า Album Detail เพื่อดูเพลงทั้งหมดในอัลบั้มนั้น
// params: albumId - รหัสอัลบั้มที่ต้องการดูเพลง
// ดึงสูงสุด 50 เพลง เพราะอัลบั้มส่วนใหญ่มีไม่เกิน 50 เพลง
// return: array ของ Song ในอัลบั้มนั้น
export const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", {
    params: { albumId, limit: 50 }, // filter ด้วย albumId และจำกัด 50 เพลง
  });
  return data.data as Song[];
};

// ─── ดึงเพลงตามแนวเพลง ───────────────────────────────────────────────────────
// ใช้แสดงในหน้า Genre Detail เพื่อดูเพลงทั้งหมดในแนวนั้น
// params: genreId - รหัสแนวเพลงที่ต้องการดูเพลง
// ดึงสูงสุด 50 เพลง เพื่อให้มีตัวเลือกหลากหลาย
// return: array ของ Song ในแนวเพลงนั้น
export const getGenreSongs = async (genreId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", {
    params: { genreId, limit: 50 }, // filter ด้วย genreId และจำกัด 50 เพลง
  });
  return data.data as Song[];
};
