// API หน้า Home — ดึงเพลงแนะนำ/ใหม่/ยอดนิยม, บันทึก play history (recordPlay), ดึงเนื้อเพลง (getSongLyricsApi) | export Song interface
//
// หลักการทำงาน:
// 1. getFeaturingSongs: GET /songs/trending?limit=10 → เพลง trending 10 อันดับ
// 2. getRecentlyPlayed/getAllPlayHistory: GET /play-history → ประวัติการเล่น
// 3. recordPlay: POST /play-history → บันทึกเมื่อเล่นเพลง (เพิ่ม play count + history)
// 4. getCategorySongs: รับ array genreIds → Promise.allSettled fetch ทุก genre พร้อมกัน → deduplicate ด้วย Set
// 5. Liked Songs API: GET/POST/DELETE /liked-songs → toggle like เพลง
// 6. Follow Artist API: GET/POST/DELETE /artist-follows → toggle follow ศิลปิน
// 7. Downloads API: GET/POST/DELETE /downloads → จัดการรายการดาวน์โหลด (ฝั่ง server record)
// 8. getSongLyricsApi: GET /songs/:id/lyrics → คืน string lyrics หรือ null

// นำเข้า apiClient ที่ตั้งค่า interceptor และ base URL ไว้แล้ว
import apiClient from "./apiClient";

// ─── Interface ข้อมูลศิลปิน ────────────────────────────────────────────────────
export interface Artist {
  id: string;              // รหัสเฉพาะของศิลปิน
  name: string;            // ชื่อศิลปิน
  imageUrl: string | null; // URL รูปภาพศิลปิน (null ถ้าไม่มี)
}

// ─── Interface ข้อมูลอัลบั้ม ───────────────────────────────────────────────────
export interface Album {
  id: string;              // รหัสเฉพาะของอัลบั้ม
  title: string;           // ชื่ออัลบั้ม
  coverUrl: string | null; // URL รูปปกอัลบั้ม (null ถ้าไม่มี)
}

// ─── Interface ข้อมูลแนวเพลง ──────────────────────────────────────────────────
export interface Genre {
  id: string;              // รหัสเฉพาะของแนวเพลง
  name: string;            // ชื่อแนวเพลง เช่น "Pop", "Rock"
  color: string | null;    // สีธีมสำหรับแสดง UI (null ถ้าไม่ได้กำหนด)
  imageUrl: string | null; // URL รูปประกอบแนวเพลง (null ถ้าไม่มี)
}

// ─── Interface ข้อมูลเพลง ──────────────────────────────────────────────────────
export interface Song {
  id: string;              // รหัสเฉพาะของเพลง
  title: string;           // ชื่อเพลง
  duration: number | null; // ความยาวเพลง (หน่วยวินาที, null ถ้าไม่ทราบ)
  playCount: number;       // จำนวนครั้งที่ถูกเล่นทั้งหมด
  filePath: string;        // path หรือ URL ของไฟล์เสียง
  coverUrl: string | null; // URL รูปปกเพลง (null ถ้าไม่มี)
  lyrics: string | null;   // เนื้อเพลง (null ถ้าไม่มี)
  artist: Artist;          // ข้อมูลศิลปินที่ร้องเพลงนี้
  album: Album;            // ข้อมูลอัลบั้มที่เพลงนี้อยู่
  genre: Genre;            // ข้อมูลแนวเพลง
}

// ─── Interface ข้อมูลประวัติการเล่น ──────────────────────────────────────────
export interface PlayHistoryItem {
  id: string;      // รหัสเฉพาะของ record ประวัติ
  playedAt: string; // วันเวลาที่เล่น (ISO string)
  song: Song;      // ข้อมูลเพลงที่เล่น
}

// ─── ดึงเพลง Trending (เพลงยอดนิยม) ──────────────────────────────────────────
// ดึงเพลง trending 10 อันดับแรก เรียงตาม play count หรือ trending score
// return: array ของ Song
export const getFeaturingSongs = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs/trending", { params: { limit: 10 } });
  return data.data as Song[];
};

// ─── ดึงประวัติการเล่นล่าสุด ─────────────────────────────────────────────────
// params: limit - จำนวนรายการที่ต้องการ (default 5)
// return: array ของ PlayHistoryItem เรียงจากล่าสุด
export const getRecentlyPlayed = async (limit = 5): Promise<PlayHistoryItem[]> => {
  const { data } = await apiClient.get("/play-history", { params: { limit } });
  return data.data as PlayHistoryItem[];
};

// ─── ดึงประวัติการเล่นทั้งหมด ────────────────────────────────────────────────
// ไม่ส่ง limit → ดึงมาทุกรายการ ใช้สำหรับหน้า history แบบ full list
// return: array ของ PlayHistoryItem ทั้งหมด
export const getAllPlayHistory = async (): Promise<PlayHistoryItem[]> => {
  const { data } = await apiClient.get("/play-history");
  return data.data as PlayHistoryItem[];
};

// ─── บันทึกประวัติการเล่นเพลง ────────────────────────────────────────────────
// params: songId - รหัสเพลงที่เพิ่งเล่น
// เรียกฟังก์ชันนี้ทุกครั้งที่ผู้ใช้เล่นเพลง เพื่อให้ระบบ track history และเพิ่ม play count
// ถ้า songId ว่างจะ return เลยโดยไม่ส่ง request (guard clause)
export const recordPlay = async (songId: string): Promise<void> => {
  if (!songId) return;
  await apiClient.post("/play-history", { songId });
};

// ─── ดึงแนวเพลงทั้งหมด ───────────────────────────────────────────────────────
// ใช้แสดงใน Browse หรือ filter เพลง
// return: array ของ Genre ทั้งหมดในระบบ
export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/genres");
  return data.data as Genre[];
};

// ─── ดึงเพลงตามแนวเพลง (สำหรับ preview) ─────────────────────────────────────
// params: genreId - รหัสแนวเพลง
// return: เพลงสูงสุด 3 เพลงของแนวนั้น ใช้แสดง preview บนหน้า Home
export const getSongsByGenre = async (genreId: string): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", { params: { genreId } });
  // slice(0, 3) เพื่อจำกัดแค่ 3 เพลงสำหรับแสดงใน section preview
  return (data.data as Song[]).slice(0, 3);
};

// ─── ดึงเพลงจากหลายแนวเพลงพร้อมกัน (สำหรับ Personalized section) ────────────
// params:
//   genreIds - รายการรหัสแนวเพลงที่ต้องการ (เลือกตาม preference ผู้ใช้)
//   limitPerGenre - จำนวนเพลงสูงสุดต่อแนว (default 6)
// ใช้ Promise.allSettled เพื่อให้ fetch ทุก genre พร้อมกัน และไม่ล้มเหลวทั้งหมดถ้า genre ใดหนึ่ง error
// return: เพลงที่รวมจากทุก genre โดยไม่ซ้ำกัน (deduplicate ด้วย Set)
export const getCategorySongs = async (genreIds: string[], limitPerGenre = 6): Promise<Song[]> => {
  // ถ้าไม่มี genre ที่ต้องการเลย ให้คืน array ว่างทันที
  if (genreIds.length === 0) return [];
  // fetch เพลงจากทุก genre พร้อมกัน
  const results = await Promise.allSettled(
    genreIds.map((id) =>
      apiClient.get("/songs", { params: { genreId: id, limit: limitPerGenre } }).then((r) => r.data.data as Song[])
    )
  );
  // ใช้ Set เก็บ id ที่เจอแล้วเพื่อ deduplicate
  const seen = new Set<string>();
  const songs: Song[] = [];
  for (const r of results) {
    // เฉพาะ request ที่สำเร็จ (fulfilled)
    if (r.status === "fulfilled") {
      for (const s of r.value) {
        // เพิ่มเพลงเฉพาะที่ยังไม่เคยเจอ
        if (!seen.has(s.id)) { seen.add(s.id); songs.push(s); }
      }
    }
  }
  return songs;
};

// ─── ลบ record ประวัติการเล่นรายการเดียว ─────────────────────────────────────
// params: id - รหัส PlayHistoryItem ที่ต้องการลบ
export const deleteHistoryRecord = async (id: string): Promise<void> => {
  await apiClient.delete(`/play-history/${id}`);
};

// ─── ลบประวัติการเล่นทั้งหมดของผู้ใช้ ───────────────────────────────────────
// ใช้ endpoint /clear-all เพื่อลบทีเดียวทั้งหมด
export const deleteAllHistory = async (): Promise<void> => {
  await apiClient.delete("/play-history/clear-all");
};

// ─── ดึงเพลงใหม่ล่าสุด ────────────────────────────────────────────────────────
// params: limit - จำนวนเพลงที่ต้องการ (default 8)
// ดึงเพลงเรียงตามวันที่เพิ่มล่าสุด แล้ว slice ให้พอดี limit
// return: array ของ Song ล่าสุด
export const getNewReleases = async (limit = 8): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", { params: { limit } });
  return (data.data as Song[]).slice(0, limit);
};

// ─── ดึงศิลปินทั้งหมดในระบบ ──────────────────────────────────────────────────
// ใช้แสดงใน Browse Artists หรือ autocomplete ค้นหา
// return: array ของ Artist ทั้งหมด
export const getAllArtists = async (): Promise<Artist[]> => {
  const { data } = await apiClient.get("/artists");
  return data.data as Artist[];
};

// ─── Artist Follow API ────────────────────────────────────────────────────────

// ดึงรายการศิลปินที่ผู้ใช้ติดตามอยู่
// return: array ของ Artist ที่ผู้ใช้ follow
export const getFollowedArtistsApi = async (): Promise<Artist[]> => {
  const { data } = await apiClient.get("/artist-follows");
  return data.data as Artist[];
};

// ติดตามศิลปิน (Follow)
// params: artistId - รหัสศิลปินที่ต้องการติดตาม
export const followArtistApi = async (artistId: string): Promise<void> => {
  await apiClient.post("/artist-follows", { artistId });
};

// เลิกติดตามศิลปิน (Unfollow)
// params: artistId - รหัสศิลปินที่ต้องการเลิกติดตาม
export const unfollowArtistApi = async (artistId: string): Promise<void> => {
  await apiClient.delete(`/artist-follows/${artistId}`);
};

// ─── Liked Songs API ──────────────────────────────────────────────────────────

// ดึงรายการเพลงที่ผู้ใช้กด Like ไว้
// backend ส่งมาเป็น array ของ { song: Song } จึงต้อง .map เพื่อดึงเฉพาะ song
// return: array ของ Song ที่ like ไว้
export const getLikedSongsApi = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/liked-songs");
  return (data.data as { song: Song }[]).map((item) => item.song);
};

// กด Like เพลง
// params: songId - รหัสเพลงที่ต้องการ like
export const likeSongApi = async (songId: string): Promise<void> => {
  await apiClient.post("/liked-songs", { songId });
};

// ยกเลิก Like เพลง
// params: songId - รหัสเพลงที่ต้องการยกเลิก like
export const unlikeSongApi = async (songId: string): Promise<void> => {
  await apiClient.delete(`/liked-songs/${songId}`);
};

// ─── Lyrics API ───────────────────────────────────────────────────────────────

// ดึงเนื้อเพลงของเพลงที่ระบุ
// params: songId - รหัสเพลงที่ต้องการดูเนื้อเพลง
// return: string ของเนื้อเพลง หรือ null ถ้าเพลงนั้นไม่มีเนื้อเพลง
export const getSongLyricsApi = async (songId: string): Promise<string | null> => {
  const { data } = await apiClient.get(`/songs/${songId}/lyrics`);
  // ใช้ optional chaining + nullish coalescing เพื่อรองรับกรณีที่ไม่มีเนื้อเพลง
  return data.data?.lyrics ?? null;
};

// ─── Downloads API ────────────────────────────────────────────────────────────

// ดึงรายการเพลงที่ผู้ใช้ดาวน์โหลดไว้
// backend ส่งมาเป็น array ของ { song: Song } จึงต้อง .map เพื่อดึงเฉพาะ song
// return: array ของ Song ที่ดาวน์โหลดไว้
export const getDownloadsApi = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/downloads");
  return (data.data as { song: Song }[]).map((item) => item.song);
};

// เพิ่มเพลงลงในรายการดาวน์โหลด (บันทึกฝั่ง server)
// params: songId - รหัสเพลงที่ต้องการดาวน์โหลด
export const addDownloadApi = async (songId: string): Promise<void> => {
  await apiClient.post("/downloads", { songId });
};

// ลบเพลงออกจากรายการดาวน์โหลด
// params: songId - รหัสเพลงที่ต้องการลบออก
export const removeDownloadApi = async (songId: string): Promise<void> => {
  await apiClient.delete(`/downloads/song/${songId}`);
};
