import apiClient from "./apiClient";

export interface Ad {
  id: string;
  title: string;
  advertiser: string;
  adType: "SPLASH" | "AFTER_SONG" | "AFTER_MULTIPLE";
  adDuration: number;
  imageUrl: string;
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
