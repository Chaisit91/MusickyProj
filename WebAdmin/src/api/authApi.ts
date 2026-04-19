// API auth admin — adminLogin, adminLogout, refreshToken
//
// หลักการทำงาน:
// 1. adminLoginApi: POST /auth/admin/login → คืน accessToken, user (role ต้องเป็น ADMIN)
// 2. logoutApi: POST /auth/logout → backend clear HttpOnly Cookie
// 3. refreshApi: POST /auth/refresh → ใช้ HttpOnly Cookie ส่ง refresh token → คืน accessToken ใหม่

// นำเข้า axios instance ที่กำหนดค่าไว้แล้ว (มี interceptor สำหรับ token)
import api from "./axios";

// ฟังก์ชันสำหรับเข้าสู่ระบบในฐานะ Admin
// endpoint: POST /auth/admin/login
// params: email, password — ข้อมูลที่ผู้ใช้กรอกในฟอร์ม login
// return: { user, accessToken, refreshToken } จาก backend
export const adminLoginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/admin/login", { email, password });
  return res.data;
};

//  ไม่ต้องส่ง refreshToken — browser ส่ง HttpOnly Cookie ให้อัตโนมัติ
// ฟังก์ชันออกจากระบบ
// endpoint: POST /auth/logout
// return: ข้อความยืนยันการ logout จาก backend
export const logoutApi = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// ฟังก์ชันขอ accessToken ใหม่โดยใช้ refreshToken
// endpoint: POST /auth/refresh
// พยายามส่ง refreshToken จาก localStorage ถ้ามี ไม่มีก็ส่ง body ว่าง
// (backend จะอ่าน refreshToken จาก HttpOnly Cookie อัตโนมัติ)
// return: { accessToken, refreshToken ใหม่ }
export const refreshApi = async () => {
  const refreshToken = localStorage.getItem("admin_refresh_token");
  const res = await api.post("/auth/refresh", refreshToken ? { refreshToken } : {});
  return res.data;
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ที่ login อยู่ปัจจุบัน
// endpoint: GET /auth/me
// ใช้ accessToken ใน header (แนบโดย axios interceptor)
// return: ข้อมูล user ปัจจุบัน
export const getMeApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
