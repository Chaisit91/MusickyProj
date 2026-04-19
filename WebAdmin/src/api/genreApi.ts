// API จัดการแนวเพลง (Admin) — getGenres, createGenre, updateGenre, deleteGenre

// นำเข้า axios instance ที่กำหนดค่าไว้แล้ว
import api from "./axios";

// ดึงสถิติภาพรวมของหมวดหมู่เพลง (genre stats)
// endpoint: GET /admin/genres/stats
// return: { totalGenres, totalSongs, avgSongsPerGenre }
export const getGenreStatsApi = async () => {
  return api.get("/admin/genres/stats");
};

// ดึงหมวดหมู่เพลงทั้งหมดในระบบ
// endpoint: GET /admin/genres
// return: รายการ genre ทั้งหมด
export const getAllGenresApi = async () => {
  return api.get("/admin/genres");
};

// ดึงข้อมูล genre ตาม ID
// endpoint: GET /admin/genres/:id
// params: id — รหัส genre
// return: ข้อมูล genre รายการเดียว
export const getGenreByIdApi = async (id: string) => {
  return api.get(`/admin/genres/${id}`);
};

// สร้าง genre ใหม่ในระบบ
// endpoint: POST /admin/genres
// ส่งเป็น multipart/form-data เพราะอาจมีไฟล์รูปภาพประกอบ genre
export const createGenreApi = async (data: {
  name: string;         // ชื่อ genre (บังคับ)
  description?: string; // คำอธิบาย genre (ไม่บังคับ)
  imageUrl?: string;    // URL รูปภาพจากภายนอก (ใช้เมื่อไม่มีไฟล์)
  color?: string;       // สีประจำ genre สำหรับ UI (hex color เช่น #FF5733)
  imageFile?: File;     // ไฟล์รูปภาพที่อัปโหลด (ใช้แทน imageUrl)
}) => {
  // สร้าง FormData สำหรับส่งพร้อมไฟล์
  const formData = new FormData();
  // เพิ่มชื่อ genre (บังคับ)
  formData.append("name", data.name);
  // เพิ่มคำอธิบายถ้ามี
  if (data.description) formData.append("description", data.description);
  // เพิ่มสีถ้ามี
  if (data.color) formData.append("color", data.color);
  // ถ้ามีไฟล์รูปให้ส่งไฟล์ ไม่งั้นส่ง URL แทน
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  // ส่ง POST พร้อมระบุว่าเป็น multipart
  return api.post("/admin/genres", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// อัปเดตข้อมูล genre ที่มีอยู่แล้ว
// endpoint: PUT /admin/genres/:id
// params: id — รหัส genre, data — ข้อมูลที่ต้องการเปลี่ยน (ทุกฟิลด์ไม่บังคับ)
export const updateGenreApi = async (id: string, data: {
  name?: string;         // ชื่อ genre ใหม่
  description?: string;  // คำอธิบายใหม่
  imageUrl?: string;     // URL รูปภาพใหม่
  color?: string;        // สีใหม่
  imageFile?: File;      // ไฟล์รูปใหม่
  removeImage?: boolean; // ✅ flag บอก backend ให้ลบรูป
}) => {
  // สร้าง FormData โดยเพิ่มเฉพาะฟิลด์ที่มีค่า
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.color) formData.append("color", data.color);
  // ลำดับความสำคัญ: ไฟล์ใหม่ > ลบรูป > URL ใหม่
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.removeImage) {
    // ✅ ส่ง flag บอก backend ให้ลบรูปออก
    formData.append("removeImage", "true");
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  // ส่ง PUT พร้อม id
  return api.put(`/admin/genres/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ลบ genre ออกจากระบบ
// endpoint: DELETE /admin/genres/:id
// params: id — รหัส genre ที่ต้องการลบ
export const deleteGenreApi = async (id: string) => {
  return api.delete(`/admin/genres/${id}`);
};

// อัปโหลดรูปภาพสำหรับ genre แยกต่างหาก (upload only)
// endpoint: POST /upload/genres
// params: file — ไฟล์รูปภาพที่ต้องการอัปโหลด
// return: URL ของรูปที่อัปโหลดสำเร็จ (string)
export const uploadGenreImageApi = async (file: File): Promise<string> => {
  // สร้าง FormData สำหรับส่งไฟล์เดียว
  const formData = new FormData();
  formData.append("image", file);
  // ส่ง POST และรอ URL กลับมา
  const res = await api.post("/upload/genres", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // ดึง URL จาก response structure: { data: { data: { url: string } } }
  return res.data.data.url;
};
