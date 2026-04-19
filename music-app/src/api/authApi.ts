// API auth — register, login, logout, fetchMe, updateProfile (multipart)
//
// หลักการทำงาน:
// 1. registerApi: POST /auth/register → backend คืน tokens ทันที (auto-login)
// 2. loginApi: POST /auth/login → คืน accessToken, refreshToken, user
// 3. fetchMeApi: GET /auth/me → ตรวจสอบ session + ดึง user ล่าสุด (ใช้หลัง restore session)
// 4. updateProfileApi: PATCH /auth/profile ด้วย multipart/form-data (รองรับ upload รูป avatar)
// 5. logoutApi: POST /auth/logout → invalidate refresh token ฝั่ง server

// นำเข้า apiClient ที่ตั้งค่า interceptor และ base URL ไว้แล้ว
import apiClient from "./apiClient";

// ─── Interface สำหรับข้อมูลที่ใช้สมัครสมาชิก ─────────────────────────────────
export interface RegisterPayload {
  name: string;       // ชื่อแสดงผลของผู้ใช้
  email: string;      // อีเมลสำหรับ login
  password: string;   // รหัสผ่าน (ควรถูก hash ที่ฝั่ง backend)
  birthDate?: string; // วันเกิด (optional) รูปแบบ ISO string เช่น "2000-01-15"
}

// ─── Interface สำหรับข้อมูลที่ใช้ login ──────────────────────────────────────
export interface LoginPayload {
  email: string;    // อีเมลของผู้ใช้
  password: string; // รหัสผ่านของผู้ใช้
}

// ─── Interface แทนข้อมูลผู้ใช้ที่ได้รับจาก server หลัง authenticate ──────────
export interface AuthUser {
  id: string;                      // รหัสเฉพาะของผู้ใช้ในระบบ
  name: string;                    // ชื่อแสดงผล
  email: string;                   // อีเมล
  role: string;                    // บทบาท เช่น "user", "admin"
  avatarUrl?: string | null;       // URL รูปโปรไฟล์ (optional)
  isPremium?: boolean;             // สถานะ premium (optional)
  premiumExpiresAt?: string | null; // วันหมดอายุ premium (optional)
}

// ─── Interface สำหรับ response ที่ได้หลัง login หรือ register สำเร็จ ──────────
export interface LoginResponse {
  success: boolean; // บอกว่า API สำเร็จหรือไม่
  data: {
    accessToken: string;  // JWT access token สำหรับใช้ใน Authorization header
    refreshToken: string; // JWT refresh token สำหรับขอ access token ใหม่
    user: AuthUser;       // ข้อมูลผู้ใช้ที่เข้าสู่ระบบ
  };
}

// ─── สมัครสมาชิกใหม่ ──────────────────────────────────────────────────────────
// params: payload - ข้อมูลสมาชิกใหม่ (ชื่อ, อีเมล, รหัสผ่าน, วันเกิด)
// return: LoginResponse (backend คืน token ทันทีหลังสมัคร ไม่ต้อง login ซ้ำ)
export const registerApi = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data as LoginResponse;
};

// ─── เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน ────────────────────────────────────────
// params: payload - อีเมลและรหัสผ่าน
// return: LoginResponse ที่มี token และข้อมูลผู้ใช้
export const loginApi = async (payload: LoginPayload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data as LoginResponse;
};

// ─── ออกจากระบบ ───────────────────────────────────────────────────────────────
// ส่ง request ไปยัง backend เพื่อ invalidate refresh token ฝั่ง server
export const logoutApi = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};

// ─── ดึงข้อมูลผู้ใช้ปัจจุบัน (ตาม token ที่แนบ) ─────────────────────────────
// ใช้ตรวจสอบ session ว่ายังใช้งานได้อยู่หรือไม่ และดึงข้อมูล user ล่าสุด
export const fetchMeApi = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data as { success: boolean; data: AuthUser };
};

// ─── อัปเดตโปรไฟล์ผู้ใช้ ─────────────────────────────────────────────────────
// params:
//   name - ชื่อใหม่ (optional)
//   avatarUri - path ของรูปภาพบน device (optional)
//   avatarMimeType - MIME type ของรูป เช่น "image/jpeg" (optional)
export const updateProfileApi = async (params: {
  name?: string;
  avatarUri?: string;
  avatarMimeType?: string;
}) => {
  const formData = new FormData();
  if (params.name) formData.append("name", params.name);
  if (params.avatarUri) {
    const filename = params.avatarUri.split("/").pop() ?? "avatar.jpg";
    formData.append("avatar", {
      uri: params.avatarUri,
      name: filename,
      type: params.avatarMimeType ?? "image/jpeg",
    } as any);
  }
  const { data } = await apiClient.patch("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { success: boolean; data: AuthUser };
};
