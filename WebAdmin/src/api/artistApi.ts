// API จัดการศิลปิน (Admin) — getArtists, createArtist, updateArtist, deleteArtist | รองรับ upload รูปศิลปิน

// นำเข้า axios instance ที่กำหนดค่าไว้แล้ว
import api from "./axios";

// ดึงศิลปินทั้งหมดในระบบ
// endpoint: GET /artists
// return: รายการศิลปินทั้งหมด
export const getAllArtistsApi = async () => {
  return api.get("/artists");
};

// ดึงข้อมูลศิลปินตาม ID
// endpoint: GET /artists/:id
// params: id — รหัสศิลปิน
// return: ข้อมูลศิลปินรายการเดียว
export const getArtistByIdApi = async (id: string) => {
  return api.get(`/artists/${id}`);
};

// สร้างศิลปินใหม่ในระบบ
// endpoint: POST /artists
// ส่งเป็น multipart/form-data เพราะอาจมีไฟล์รูปโปรไฟล์
export const createArtistApi = async (data: {
  name: string;       // ชื่อศิลปิน (บังคับ)
  bio?: string;       // ประวัติย่อของศิลปิน (ไม่บังคับ)
  imageUrl?: string;  // URL รูปโปรไฟล์จากภายนอก (ใช้เมื่อไม่มีไฟล์)
  imageFile?: File;   // ไฟล์รูปโปรไฟล์ที่อัปโหลด (ใช้แทน imageUrl)
}) => {
  // สร้าง FormData สำหรับส่งพร้อมไฟล์
  const formData = new FormData();
  // เพิ่มชื่อศิลปิน (บังคับ)
  formData.append("name", data.name);
  // เพิ่มประวัติถ้ามี
  if (data.bio) formData.append("bio", data.bio);
  // ถ้ามีไฟล์รูปให้ส่งไฟล์ ไม่งั้นส่ง URL แทน
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  // ส่ง POST พร้อมระบุว่าเป็น multipart
  return api.post("/artists", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// อัปเดตข้อมูลศิลปินที่มีอยู่แล้ว
// endpoint: PUT /artists/:id
// params: id — รหัสศิลปิน, data — ข้อมูลที่ต้องการเปลี่ยน (ทุกฟิลด์ไม่บังคับ)
export const updateArtistApi = async (id: string, data: {
  name?: string;      // ชื่อศิลปินใหม่
  bio?: string;       // ประวัติย่อใหม่ (ส่งค่าว่างได้เพื่อลบออก)
  imageUrl?: string;  // URL รูปโปรไฟล์ใหม่
  imageFile?: File;   // ไฟล์รูปโปรไฟล์ใหม่
}) => {
  // สร้าง FormData โดยเพิ่มเฉพาะฟิลด์ที่มีค่า
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  // bio ใช้ !== undefined เพราะต้องรองรับการส่งค่าว่าง ""
  if (data.bio !== undefined) formData.append("bio", data.bio);
  // ถ้ามีไฟล์ใหม่ให้ส่งไฟล์ ไม่งั้นถ้ามี imageUrl ก็ส่ง URL
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  } else if (data.imageUrl !== undefined) {
    formData.append("imageUrl", data.imageUrl);
  }
  // ส่ง PUT พร้อม id
  return api.put(`/artists/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ลบศิลปินออกจากระบบ
// endpoint: DELETE /artists/:id
// params: id — รหัสศิลปินที่ต้องการลบ
export const deleteArtistApi = async (id: string) => {
  return api.delete(`/artists/${id}`);
};
