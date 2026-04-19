// API ค้นหา — ค้นหาเพลง/ศิลปิน/อัลบั้ม/แนวเพลง แบบ real-time ด้วย keyword
//
// หลักการทำงาน:
// 1. searchAll: GET /search?q= พร้อม custom serializer encode ภาษาไทย → merge ศิลปินจากเพลงที่ชื่อตรงด้วย
// 2. searchByLyrics: GET /search/lyrics?q= → ส่งให้ AI ค้นหา → คืน LyricsSearchResult พร้อม aiUsed:true
// 3. getTrendingArtists: GET /songs/trending?limit=20 → แยก artist unique จากเพลง → slice 10 อันดับ
// 4. getBrowseGenres: GET /genres → ทุก genre สำหรับหน้า Browse
// 5. Search History API: GET/POST/DELETE /search/history/items → จัดการประวัติการค้นหา

// นำเข้า apiClient ที่ตั้งค่า interceptor และ base URL ไว้แล้ว
import apiClient from "./apiClient";
// นำเข้า type Artist, Song, Genre จาก homeApi เพื่อใช้ใน search result
import { Artist, Song, Genre } from "./homeApi";

// ─── Shared serializer (รองรับภาษาไทยและอักขระพิเศษ) ────────────────────────
// encodeURIComponent แปลงแต่ละ key และ value ให้เป็น URL-safe string
// จำเป็นต้องใช้เพราะ axios default serializer บางครั้ง encode ภาษาไทยไม่ถูกต้อง
const serialize = (params: Record<string, unknown>) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

// ─── Type ของผลลัพธ์การค้นหา ───────────────────────────────────────────────────
export interface SearchResult {
  songs: Song[];     // เพลงที่ตรงกับคำค้นหา
  artists: Artist[]; // ศิลปินที่ตรงกับคำค้นหา
}

// ─── ค้นหาแบบ full-text ผ่าน backend endpoint /search?q= ───────────────────────
// params: query - คำค้นหาที่ผู้ใช้พิมพ์
// normalize("NFC") แปลงอักขระ Unicode ให้เป็นรูปแบบมาตรฐาน (สำคัญสำหรับภาษาไทย)
// trim() ตัดช่องว่างหัว-ท้าย
// นอกจากผลลัพธ์จาก backend แล้ว ยังรวมศิลปินที่ชื่อตรงกับคำค้นแต่อาจถูก backend พลาด
// return: SearchResult ที่มีทั้งเพลงและศิลปิน
export const searchAll = async (query: string): Promise<SearchResult> => {
  // normalize และ trim คำค้นหาเพื่อให้ match ถูกต้อง
  const q = query.normalize("NFC").trim();
  // lowercase เพื่อใช้เปรียบเทียบแบบ case-insensitive ฝั่ง client
  const lower = q.toLowerCase();

  const { data } = await apiClient.get("/search", {
    params: { q },
    // ใช้ serializer ที่สร้างไว้เพื่อ encode ภาษาไทยให้ถูกต้อง
    paramsSerializer: serialize,
  });

  // แปลง response เป็น array ของ Song และ Artist (fallback เป็น [] ถ้าไม่มีข้อมูล)
  const songs = (data.data?.songs ?? []) as Song[];
  const artists = (data.data?.artists ?? []) as Artist[];

  // สร้าง Map จาก id → Artist เพื่อ deduplicate และ merge ศิลปินจากเพลง
  // บางครั้ง backend อาจไม่ส่งศิลปินมาใน artists list แม้ชื่อจะตรงกัน
  const artistMap = new Map<string, Artist>(artists.map((a) => [a.id, a]));
  songs.forEach((s) => {
    // ถ้าชื่อศิลปินของเพลงตรงกับคำค้นหา → เพิ่มเข้า artistMap ด้วย
    if (s.artist.name.toLowerCase().includes(lower)) {
      artistMap.set(s.artist.id, s.artist);
    }
  });

  // คืนเพลงและรายการศิลปินที่ merge แล้ว
  return { songs, artists: Array.from(artistMap.values()) };
};

// ─── ดึง Trending Artists (ดึงจากเพลง trending) ─────────────────────────────
// ดึงเพลง trending 20 อันดับ แล้วแยกเอาศิลปินที่ไม่ซ้ำ 10 อันดับแรก
// วิธีนี้ไม่ต้องมี endpoint /artists/trending แยกต่างหาก
// return: array ของ Artist ไม่เกิน 10 คน
export const getTrendingArtists = async (): Promise<Artist[]> => {
  const { data } = await apiClient.get("/songs/trending", {
    params: { limit: 20 }, // ดึงเพลง trending มา 20 เพลงเพื่อให้มีศิลปินหลากหลาย
  });
  const songs = data.data as Song[];
  // ใช้ Set ติดตามว่าเจอ artistId ใดแล้วบ้าง (deduplicate)
  const seen = new Set<string>();
  return songs
    .map((s) => s.artist) // แยกเอาเฉพาะข้อมูลศิลปิน
    .filter((a) => {
      // กรองศิลปินซ้ำออก: ถ้าเคยเจอแล้วให้ return false (ข้าม)
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .slice(0, 10); // จำกัดแค่ 10 ศิลปิน
};

// ─── ดึงแนวเพลงสำหรับหน้า Browse ─────────────────────────────────────────────
// ใช้แสดงเป็น grid ของ genre cards บนหน้า Search/Browse
// return: array ของ Genre ทั้งหมด
export const getBrowseGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/genres");
  return data.data as Genre[];
};

// ─── Type ขยายจาก SearchResult สำหรับผลค้นหาด้วย AI lyrics ──────────────────
// aiUsed: true บอกว่าผลลัพธ์นี้มาจาก AI lyrics search (ไม่ใช่ keyword ปกติ)
export interface LyricsSearchResult extends SearchResult {
  aiUsed: true;
}

// ─── ค้นหาเพลงจากเนื้อเพลงด้วย AI ───────────────────────────────────────────
// params: query - เนื้อเพลงหรือท่อนเพลงที่ผู้ใช้จำได้
// ส่งไปยัง endpoint /search/lyrics ซึ่ง backend ใช้ AI ค้นหาเนื้อเพลงที่คล้ายกัน
// return: LyricsSearchResult ที่มี flag aiUsed = true
export const searchByLyrics = async (query: string): Promise<LyricsSearchResult> => {
  // normalize คำค้นหาเพื่อให้ AI ประมวลผลได้ถูกต้อง
  const q = query.normalize("NFC").trim();
  const { data } = await apiClient.get("/search/lyrics", {
    params: { q },
    paramsSerializer: serialize, // ใช้ serializer รองรับภาษาไทย
  });
  const songs = (data.data?.songs ?? []) as Song[];
  const artists = (data.data?.artists ?? []) as Artist[];
  // เพิ่ม aiUsed: true เพื่อให้ UI รู้ว่าผลนี้มาจาก AI lyrics search
  return { songs, artists, aiUsed: true };
};

// ─── Interface ข้อมูล Search History แบบ rich (มีรูปและ subtitle) ─────────────
export interface SearchHistoryItem {
  id: string;                                           // รหัสเฉพาะของ history record
  itemId: string;                                       // รหัสของ item ที่ค้นหา (songId / artistId ฯลฯ)
  itemType: "song" | "artist" | "album" | "playlist";  // ประเภทของ item
  title: string;                                        // ชื่อหลักที่แสดง เช่น ชื่อเพลง
  subtitle: string;                                     // ข้อมูลรอง เช่น ชื่อศิลปิน
  coverUrl: string | null;                              // URL รูปประกอบ (null ถ้าไม่มี)
  searchedAt: string;                                   // วันเวลาที่ค้นหา (ISO string)
}

// ─── ดึงประวัติการค้นหา (rich history) ───────────────────────────────────────
// return: array ของ SearchHistoryItem เรียงจากล่าสุด
export const getSearchHistoryItemsApi = async (): Promise<SearchHistoryItem[]> => {
  const { data } = await apiClient.get("/search/history/items");
  return data.data as SearchHistoryItem[];
};

// ─── เพิ่ม item เข้าประวัติการค้นหา ──────────────────────────────────────────
// เรียกทุกครั้งที่ผู้ใช้กดเลือก item จากผลค้นหา เพื่อบันทึกลง history
// params:
//   itemId - รหัสของ item ที่เลือก
//   itemType - ประเภทของ item
//   title - ชื่อหลัก
//   subtitle - ชื่อรอง
//   coverUrl - URL รูป (optional)
export const addSearchHistoryItemApi = async (item: {
  itemId: string;
  itemType: string;
  title: string;
  subtitle: string;
  coverUrl?: string | null;
}): Promise<void> => {
  await apiClient.post("/search/history/items", item);
};

// ─── ลบ history item รายการเดียว ──────────────────────────────────────────────
// params: id - รหัสของ SearchHistoryItem ที่ต้องการลบ
export const removeSearchHistoryItemApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/search/history/items/${id}`);
};

// ─── ลบประวัติการค้นหาทั้งหมด ────────────────────────────────────────────────
// ใช้เมื่อผู้ใช้กด "Clear all" ในหน้าค้นหา
export const clearSearchHistoryItemsApi = async (): Promise<void> => {
  await apiClient.delete("/search/history/items");
};
