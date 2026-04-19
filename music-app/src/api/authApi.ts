// API auth — register, login, logout, googleLogin, fetchMe, updateProfile (multipart), forgotPassword (ส่ง OTP), resetPassword
//
// หลักการทำงาน:
// 1. registerApi: POST /auth/register → backend คืน tokens ทันที (auto-login)
// 2. loginApi: POST /auth/login → คืน accessToken, refreshToken, user
// 3. googleLoginApi: POST /auth/google → ถ้า requiresName=true ต้องตั้งชื่อก่อน (Google login ครั้งแรก)
// 4. fetchMeApi: GET /auth/me → ตรวจสอบ session + ดึง user ล่าสุด (ใช้หลัง restore session)
// 5. updateProfileApi: PATCH /auth/profile ด้วย multipart/form-data (รองรับ upload รูป avatar)
// 6. logoutApi: POST /auth/logout → invalidate refresh token ฝั่ง server

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

<<<<<<< HEAD
// ─── ขอ OTP สำหรับรีเซ็ตรหัสผ่าน ─────────────────────────────────────────────
// params: email - อีเมลที่ต้องการรีเซ็ตรหัสผ่าน
// return: success flag, ข้อความ, และอาจมี OTP (dev mode)
export const forgotPasswordApi = async (email: string) => {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data as { success: boolean; message: string; data?: { otp: string } };
};

// ─── รีเซ็ตรหัสผ่านด้วย OTP ──────────────────────────────────────────────────
// params: email - อีเมลที่ขอ OTP, otp - รหัส OTP ที่ได้รับ, newPassword - รหัสผ่านใหม่
// return: success flag และข้อความแจ้งผล
export const resetPasswordApi = async (email: string, otp: string, newPassword: string) => {
  const { data } = await apiClient.post("/auth/reset-password", { email, otp, newPassword });
  return data as { success: boolean; message: string };
};

// ─── สมัครสมาชิกใหม่ ──────────────────────────────────────────────────────────
// params: payload - ข้อมูลสมาชิกใหม่ (ชื่อ, อีเมล, รหัสผ่าน, วันเกิด)
// return: LoginResponse (backend คืน token ทันทีหลังสมัคร ไม่ต้อง login ซ้ำ)
=======
>>>>>>> d644fe44f32236481b9e824505657910f9ebd318
export const registerApi = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data as LoginResponse; // backend now returns tokens on register
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
// return: ข้อมูล response ทั่วไปจาก server
export const logoutApi = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};

<<<<<<< HEAD
// ─── Interface สำหรับ response เมื่อ login ด้วย Google ──────────────────────
export interface GoogleLoginResponse {
  success: boolean;      // API สำเร็จหรือไม่
  requiresName: boolean; // true = ผู้ใช้ใหม่ที่ยังไม่มีชื่อ ต้องให้กรอกชื่อ
  // กรณี requiresName = true → ส่งข้อมูลชั่วคราวเพื่อให้กรอกชื่อก่อน
  googleData?: {
    googleId: string;      // Google unique ID
    email: string;         // อีเมลจาก Google
    suggestedName: string; // ชื่อที่ Google แนะนำ (จาก profile)
    avatarUrl: string | null; // URL รูปโปรไฟล์จาก Google
    accessToken: string;   // token ชั่วคราวสำหรับส่งชื่อในขั้นต่อไป
  };
  // กรณี requiresName = false → ผู้ใช้เคย login Google แล้ว คืน token ปกติ
  data?: {
    accessToken: string;  // JWT access token
    refreshToken: string; // JWT refresh token
    user: AuthUser;       // ข้อมูลผู้ใช้
  };
}

// ─── Login หรือ register ด้วย Google OAuth ────────────────────────────────────
// params: accessToken - Google OAuth token, name - ชื่อที่ผู้ใช้กรอก (เฉพาะครั้งแรก)
// return: GoogleLoginResponse ที่บอกว่าต้องกรอกชื่อหรือเข้าได้เลย
export const googleLoginApi = async (params: { accessToken: string; name?: string }) => {
  const { data } = await apiClient.post("/auth/google", params);
  return data as GoogleLoginResponse;
};

// ─── ดึงข้อมูลผู้ใช้ปัจจุบัน (ตาม token ที่แนบ) ─────────────────────────────
// ใช้ตรวจสอบ session ว่ายังใช้งานได้อยู่หรือไม่ และดึงข้อมูล user ล่าสุด
// return: ข้อมูล AuthUser ของผู้ใช้ที่ login อยู่
=======
>>>>>>> d644fe44f32236481b9e824505657910f9ebd318
export const fetchMeApi = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data as { success: boolean; data: AuthUser };
};

// ─── อัปเดตโปรไฟล์ผู้ใช้ ─────────────────────────────────────────────────────
// params:
//   name - ชื่อใหม่ (optional)
//   avatarUri - path ของรูปภาพบน device (optional)
//   avatarMimeType - MIME type ของรูป เช่น "image/jpeg" (optional)
// ใช้ FormData เพราะมีการอัปโหลดไฟล์ภาพ (ต้อง multipart/form-data)
// return: ข้อมูล AuthUser หลังอัปเดต
export const updateProfileApi = async (params: {
  name?: string;
  avatarUri?: string;
  avatarMimeType?: string;
}) => {
  // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart
  const formData = new FormData();
  // เพิ่มชื่อถ้ามีการส่งมา
  if (params.name) formData.append("name", params.name);
  if (params.avatarUri) {
    // ดึงชื่อไฟล์จาก URI (ตัด path ส่วนหน้าออก)
    const filename = params.avatarUri.split("/").pop() ?? "avatar.jpg";
    // เพิ่มไฟล์รูปภาพเข้า FormData พร้อม metadata ที่ React Native ต้องการ
    formData.append("avatar", {
      uri: params.avatarUri,       // path ของไฟล์บน device
      name: filename,              // ชื่อไฟล์
      type: params.avatarMimeType ?? "image/jpeg", // MIME type (default jpeg)
    } as any);
  }
  // ส่ง PATCH request พร้อม override Content-Type เป็น multipart/form-data
  const { data } = await apiClient.patch("/auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { success: boolean; data: AuthUser };
};
