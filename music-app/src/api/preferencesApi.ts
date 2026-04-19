// API ตั้งค่าผู้ใช้ — ดึงและอัปเดต: musicLanguage, streamingQuality, downloadQuality, autoPlay, showLyrics
//
// หลักการทำงาน:
// 1. getPreferencesApi: GET /users/me/preferences → ดึง preferences ของ user ที่ login อยู่
// 2. updatePreferencesApi: PUT /users/me/preferences → อัปเดต preferences ทั้งชุด (Partial input)
// 3. ทั้งคู่ใช้ apiClient ที่มี interceptor แนบ token อัตโนมัติ

// นำเข้า apiClient ที่ตั้งค่า interceptor และ base URL ไว้แล้ว
import apiClient from "./apiClient";

// ─── Interface สำหรับการตั้งค่าความชอบของผู้ใช้ ──────────────────────────────
export interface UserPreferences {
  streamingQuality: string;   // คุณภาพเสียงตอน streaming เช่น "LOW", "MEDIUM", "HIGH"
  downloadQuality: string;    // คุณภาพเสียงตอนดาวน์โหลด เช่น "LOW", "MEDIUM", "HIGH"
  musicLanguages: string[];   // รายการภาษาเพลงที่ชอบ เช่น ["th", "en"]
  autoPlay: boolean;          // เล่นเพลงต่อเนื่องอัตโนมัติหรือไม่
  showLyrics: boolean;        // แสดงเนื้อเพลงอัตโนมัติขณะเล่นหรือไม่
}

// ─── ดึงการตั้งค่าความชอบของผู้ใช้ปัจจุบัน ──────────────────────────────────
// เรียกตอน app โหลดครั้งแรก หรือเมื่อผู้ใช้เข้าหน้า Settings
// return: UserPreferences ของผู้ใช้ที่ login อยู่
export const getPreferencesApi = async (): Promise<UserPreferences> => {
  const { data } = await apiClient.get("/users/me/preferences");
  return data.data as UserPreferences;
};

// ─── อัปเดตการตั้งค่าความชอบของผู้ใช้ ───────────────────────────────────────
// params: prefs - ข้อมูลที่ต้องการอัปเดต (Partial → ส่งมาแค่บางฟิลด์ได้)
// ใช้ HTTP PUT เพราะ backend รับข้อมูล preference ทั้งชุดในแต่ละครั้ง
// return: UserPreferences ที่อัปเดตแล้ว (ล่าสุดจาก server)
export const updatePreferencesApi = async (
  prefs: Partial<UserPreferences>
): Promise<UserPreferences> => {
  const { data } = await apiClient.put("/users/me/preferences", prefs);
  return data.data as UserPreferences;
};
