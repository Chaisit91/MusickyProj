// API จัดการอัลบั้ม (Admin) — getAlbums, createAlbum, updateAlbum, deleteAlbum | รองรับ upload ปก

// นำเข้า axios instance ที่กำหนดค่าไว้แล้ว
import api from "./axios";

// ดึงอัลบั้มทั้งหมดในระบบ
// endpoint: GET /albums
// return: รายการอัลบั้มทั้งหมด
export const getAllAlbumsApi = async () => {
  return api.get("/albums");
};

// ดึงข้อมูลอัลบั้มตาม ID
// endpoint: GET /albums/:id
// params: id — รหัสอัลบั้ม
// return: ข้อมูลอัลบั้มรายการเดียว พร้อม artist และ songs
export const getAlbumByIdApi = async (id: string) => {
  return api.get(`/albums/${id}`);
};

// ดึงอัลบั้มทั้งหมดของศิลปินคนใดคนหนึ่ง
// endpoint: GET /albums/artist/:artistId
// params: artistId — รหัสศิลปิน
// return: รายการอัลบั้มของศิลปินนั้น
export const getAlbumsByArtistApi = async (artistId: string) => {
  return api.get(`/albums/artist/${artistId}`);
};

// สร้างอัลบั้มใหม่
// endpoint: POST /albums
// ส่งเป็น multipart/form-data เพราะอาจมีไฟล์รูปปก
export const createAlbumApi = async (data: {
  title: string;       // ชื่ออัลบั้ม (บังคับ)
  artistId: string;    // รหัสศิลปินที่เป็นเจ้าของอัลบั้ม (บังคับ)
  releaseDate: string; // วันที่วางจำหน่าย (บังคับ)
  coverUrl?: string;   // URL รูปปกจากภายนอก (ใช้เมื่อไม่มีไฟล์)
  coverFile?: File;    // ไฟล์รูปปกที่อัปโหลด (ใช้แทน coverUrl)
}) => {
  // สร้าง FormData สำหรับส่งพร้อมไฟล์
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("artistId", data.artistId);
  formData.append("releaseDate", data.releaseDate);
  // ถ้ามีไฟล์รูปให้ส่งไฟล์ ไม่งั้นส่ง URL แทน
  if (data.coverFile) {
    formData.append("image", data.coverFile);
  } else if (data.coverUrl) {
    formData.append("coverUrl", data.coverUrl);
  }
  // ส่ง POST พร้อมระบุว่าเป็น multipart
  return api.post("/albums", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// อัปเดตข้อมูลอัลบั้มที่มีอยู่แล้ว
// endpoint: PUT /albums/:id
// params: id — รหัสอัลบั้ม, data — ข้อมูลที่ต้องการเปลี่ยน (ทุกฟิลด์ไม่บังคับ)
export const updateAlbumApi = async (id: string, data: {
  title?: string;       // ชื่ออัลบั้มใหม่
  artistId?: string;    // ศิลปินใหม่
  releaseDate?: string; // วันที่วางจำหน่ายใหม่
  coverUrl?: string;    // URL รูปปกใหม่
  coverFile?: File;     // ไฟล์รูปปกใหม่
}) => {
  // สร้าง FormData โดยเพิ่มเฉพาะฟิลด์ที่มีค่า
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.artistId) formData.append("artistId", data.artistId);
  if (data.releaseDate) formData.append("releaseDate", data.releaseDate);
  // ถ้ามีไฟล์ใหม่ให้ส่งไฟล์ ไม่งั้นถ้ามี coverUrl ก็ส่ง URL
  if (data.coverFile) {
    formData.append("image", data.coverFile);
  } else if (data.coverUrl !== undefined) {
    formData.append("coverUrl", data.coverUrl);
  }
  // ส่ง PUT พร้อม id
  return api.put(`/albums/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ลบอัลบั้มออกจากระบบ
// endpoint: DELETE /albums/:id
// params: id — รหัสอัลบั้มที่ต้องการลบ
export const deleteAlbumApi = async (id: string) => {
  return api.delete(`/albums/${id}`);
};
