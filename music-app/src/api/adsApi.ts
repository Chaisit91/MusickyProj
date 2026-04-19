// API โฆษณา — ดึง ad ตามประเภท (SPLASH/AFTER_SONG/AFTER_MULTIPLE), ดึง ad ที่ active, บันทึก impression สำหรับ analytics
//
// หลักการทำงาน:
// 1. fetchAdByType(type): GET /ads/active?type=TYPE → คืน Ad หรือ null ถ้าไม่มี
// 2. fetchAnyActiveAd(): GET /ads/active (ไม่ filter type) → ใช้เป็น fallback เมื่อไม่มี ad ตาม type ที่ต้องการ
// 3. recordImpressionApi(id): POST /ads/:id/impression → บันทึกว่า user เห็น ad แล้ว สำหรับ analytics

import apiClient from "./apiClient";

export interface Ad {
  id: string;
  title: string;
  advertiser: string;
  adType: "SPLASH" | "AFTER_SONG" | "AFTER_MULTIPLE";
  adDuration: number;
  imageUrl: string;
  linkUrl?: string;
  impressions: number;
  isActive: boolean;
}

export const fetchAdByType = async (type: "SPLASH" | "AFTER_SONG" | "AFTER_MULTIPLE"): Promise<Ad | null> => {
  const { data } = await apiClient.get(`/ads/active?type=${type}`);
  return (data as { success: boolean; data: Ad | null }).data;
};

// ดึง ad ใดก็ได้ที่ active (ไม่ filter type) — ใช้ fallback ตอน splash
export const fetchAnyActiveAd = async (): Promise<Ad | null> => {
  const { data } = await apiClient.get(`/ads/active`);
  return (data as { success: boolean; data: Ad | null }).data;
};

export const recordImpressionApi = async (id: string): Promise<void> => {
  await apiClient.post(`/ads/${id}/impression`);
};
