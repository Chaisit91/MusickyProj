// API จัดการ playlist — สร้าง, แก้ไข, ลบ playlist | เพิ่ม/ลบเพลงใน playlist | ดึง playlist ของ user
//
// หลักการทำงาน:
// 1. getPlaylistsApi: GET /playlists → playlist ทั้งหมดของ user พร้อม songs ข้างใน
// 2. createPlaylistApi(title): POST /playlists → สร้าง playlist ใหม่
// 3. deletePlaylistApi(id): DELETE /playlists/:id → ลบ playlist (cascade ลบ songs ใน playlist ด้วย)
// 4. addSongToPlaylistApi: POST /playlists/:id/songs → เพิ่มเพลงเข้า playlist
// 5. removeSongFromPlaylistApi: DELETE /playlists/:id/songs/:songId → ลบเพลงออก

// นำเข้า apiClient ที่ตั้งค่า interceptor และ base URL ไว้แล้ว
import apiClient from "./apiClient";
// นำเข้า type Song จาก homeApi เพื่อใช้ใน playlistSongs
import { Song } from "./homeApi";

// ─── Interface ข้อมูล Playlist จาก API ──────────────────────────────────────
export interface ApiPlaylist {
  id: string;          // รหัสเฉพาะของ playlist
  name: string;        // ชื่อ playlist
  createdAt: string;   // วันเวลาที่สร้าง (ISO string)
  playlistSongs: { song: Song }[]; // รายการเพลงใน playlist (wrapped ใน object)
}

// ─── ดึง playlist ทั้งหมดของผู้ใช้ ───────────────────────────────────────────
// return: axios response ที่มี data เป็น array ของ ApiPlaylist
// ใช้ generic type เพื่อให้ TypeScript รู้ structure ของ response
export const getPlaylistsApi = () =>
  apiClient.get<{ data: ApiPlaylist[] }>("/playlists");

// ─── สร้าง playlist ใหม่ ───────────────────────────────────────────────────────
// params: title - ชื่อ playlist ที่ต้องการสร้าง
// return: axios response ที่มี data เป็น ApiPlaylist ที่เพิ่งสร้าง
export const createPlaylistApi = (title: string) =>
  apiClient.post<{ data: ApiPlaylist }>("/playlists", { name: title });

// ─── ลบ playlist ───────────────────────────────────────────────────────────────
// params: id - รหัส playlist ที่ต้องการลบ
// ลบ playlist พร้อมกับ playlistSongs ทั้งหมดใน playlist นั้น (cascade ฝั่ง backend)
export const deletePlaylistApi = (id: string) =>
  apiClient.delete(`/playlists/${id}`);

// ─── เพิ่มเพลงเข้า playlist ───────────────────────────────────────────────────
// params:
//   playlistId - รหัส playlist ที่ต้องการเพิ่มเพลง
//   songId - รหัสเพลงที่ต้องการเพิ่ม
// return: axios response (ไม่ระบุ type เพราะไม่จำเป็นต้องใช้ data)
export const addSongToPlaylistApi = (playlistId: string, songId: string) =>
  apiClient.post(`/playlists/${playlistId}/songs`, { songId });

// ─── ลบเพลงออกจาก playlist ────────────────────────────────────────────────────
// params:
//   playlistId - รหัส playlist ที่ต้องการลบเพลงออก
//   songId - รหัสเพลงที่ต้องการลบ
// return: axios response (ไม่ระบุ type เพราะไม่จำเป็นต้องใช้ data)
export const removeSongFromPlaylistApi = (playlistId: string, songId: string) =>
  apiClient.delete(`/playlists/${playlistId}/songs/${songId}`);
