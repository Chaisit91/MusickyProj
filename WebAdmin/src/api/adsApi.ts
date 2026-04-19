// API จัดการโฆษณา (Admin) — getAds, createAd, updateAd, deleteAd, toggleAdActive | รองรับ multipart upload image/video

// นำเข้า axios instance ที่กำหนดค่าไว้แล้ว
import api from "./axios";

// ดึงสถิติภาพรวมของโฆษณาทั้งหมด (จำนวน, active, impressions)
// endpoint: GET /admin/ads/stats
// return: { totalAds, activeAds, totalImpressions }
export const getAdsStatsApi = async () => {
  return api.get("/admin/ads/stats");
};

// ดึงรายการโฆษณาทั้งหมดในระบบ
// endpoint: GET /admin/ads
// return: รายการโฆษณาทั้งหมด
export const getAllAdsApi = async () => {
  return api.get("/admin/ads");
};

// ดึงข้อมูลโฆษณาตาม ID
// endpoint: GET /admin/ads/:id
// params: id — รหัสโฆษณาที่ต้องการดู
// return: ข้อมูลโฆษณารายการเดียว
export const getAdsByIdApi = async (id: string) => {
  return api.get(`/admin/ads/${id}`);
};

// สร้างโฆษณาใหม่ในระบบ
// endpoint: POST /admin/ads
// ส่งเป็น multipart/form-data เพราะมีไฟล์สื่อ (รูปภาพ/วิดีโอ)
export const createAdsApi = async (data: {
  title: string;        // ชื่อโฆษณา
  adType: string;       // ประเภทโฆษณา (SPLASH, AFTER_SONG ฯลฯ)
  adDuration: number;   // ระยะเวลาแสดงโฆษณา (วินาที)
  advertiser: string;   // ชื่อผู้โฆษณา
  linkUrl?: string;     // URL ที่คลิกแล้วจะไป (ไม่บังคับ)
  isActive?: boolean;   // สถานะเปิด/ปิดใช้งาน (ไม่บังคับ)
  priority?: number;    // ลำดับความสำคัญในการแสดง (ไม่บังคับ)
  startDate?: string;   // วันที่เริ่มแสดงโฆษณา (ไม่บังคับ)
  endDate?: string;     // วันที่สิ้นสุดการแสดง (ไม่บังคับ)
  mediaFile: File;      // ไฟล์สื่อโฆษณา (บังคับ)
}) => {
  // สร้าง FormData สำหรับส่งข้อมูลพร้อมไฟล์
  const fd = new FormData();
  // เพิ่มฟิลด์บังคับทุกฟิลด์
  fd.append("title", data.title);
  fd.append("adType", data.adType);
  // แปลง number เป็น string เพราะ FormData รับเฉพาะ string/Blob
  fd.append("adDuration", String(data.adDuration));
  fd.append("advertiser", data.advertiser);
  // เพิ่มฟิลด์ที่ไม่บังคับ เฉพาะเมื่อมีค่า
  if (data.linkUrl !== undefined) fd.append("linkUrl", data.linkUrl);
  if (data.isActive !== undefined) fd.append("isActive", String(data.isActive));
  if (data.priority !== undefined) fd.append("priority", String(data.priority));
  if (data.startDate) fd.append("startDate", data.startDate);
  if (data.endDate) fd.append("endDate", data.endDate);
  // แนบไฟล์สื่อโฆษณา
  fd.append("media", data.mediaFile);
  // ส่ง POST พร้อมระบุ Content-Type เป็น multipart/form-data
  return api.post("/admin/ads", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

// อัปเดตข้อมูลโฆษณาที่มีอยู่แล้ว
// endpoint: PUT /admin/ads/:id
// params: id — รหัสโฆษณา, data — ข้อมูลที่ต้องการเปลี่ยน (ทุกฟิลด์ไม่บังคับ)
export const updateAdsApi = async (id: string, data: {
  title?: string;       // ชื่อโฆษณาใหม่
  adType?: string;      // ประเภทโฆษณาใหม่
  adDuration?: number;  // ระยะเวลาใหม่
  advertiser?: string;  // ชื่อผู้โฆษณาใหม่
  linkUrl?: string;     // URL ใหม่
  isActive?: boolean;   // สถานะเปิด/ปิดใหม่
  priority?: number;    // ลำดับความสำคัญใหม่
  startDate?: string;   // วันเริ่มต้นใหม่
  endDate?: string;     // วันสิ้นสุดใหม่
  mediaFile?: File;     // ไฟล์สื่อใหม่ (ไม่บังคับ)
}) => {
  // สร้าง FormData สำหรับส่งเฉพาะฟิลด์ที่มีค่า (partial update)
  const fd = new FormData();
  if (data.title !== undefined) fd.append("title", data.title);
  if (data.adType !== undefined) fd.append("adType", data.adType);
  if (data.adDuration !== undefined) fd.append("adDuration", String(data.adDuration));
  if (data.advertiser !== undefined) fd.append("advertiser", data.advertiser);
  if (data.linkUrl !== undefined) fd.append("linkUrl", data.linkUrl);
  if (data.isActive !== undefined) fd.append("isActive", String(data.isActive));
  if (data.priority !== undefined) fd.append("priority", String(data.priority));
  if (data.startDate !== undefined) fd.append("startDate", data.startDate);
  if (data.endDate !== undefined) fd.append("endDate", data.endDate);
  // แนบไฟล์ใหม่เฉพาะเมื่อมีการอัปโหลดไฟล์
  if (data.mediaFile) fd.append("media", data.mediaFile);
  // ส่ง PUT พร้อม id และข้อมูลที่เปลี่ยน
  return api.put(`/admin/ads/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
};

// สลับสถานะเปิด/ปิดโฆษณา (toggle isActive)
// endpoint: PATCH /admin/ads/:id/toggle
// params: id — รหัสโฆษณา
export const toggleAdsApi = async (id: string) => {
  return api.patch(`/admin/ads/${id}/toggle`);
};

// ลบโฆษณาออกจากระบบ
// endpoint: DELETE /admin/ads/:id
// params: id — รหัสโฆษณาที่ต้องการลบ
export const deleteAdsApi = async (id: string) => {
  return api.delete(`/admin/ads/${id}`);
};
