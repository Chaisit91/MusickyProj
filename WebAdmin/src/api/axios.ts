// Axios instance ของ WebAdmin — ตั้ง baseURL, interceptor แนบ access token ทุก request, refresh token อัตโนมัติเมื่อ 401, redirect /login เมื่อ refresh หมด
//
// หลักการทำงาน:
// 1. สร้าง axios instance พร้อม withCredentials:true (ส่ง HttpOnly Cookie ทุก request)
// 2. Request interceptor: อ่าน accessToken จาก Redux store (memory) → แนบ Authorization header
// 3. Response interceptor - 401 handling (silent refresh):
//    - ถ้ากำลัง refresh: เพิ่ม request เข้า failedQueue
//    - ถ้ายังไม่ refresh: dispatch refreshTokenThunk → ถ้าสำเร็จ processQueue + retry request
//    - ถ้า refresh ล้มเหลว: processQueue(error), logout, redirect /login
// 4. token อยู่ใน memory (Redux) เท่านั้น, refresh token อยู่ใน HttpOnly Cookie (browser จัดการเอง)

// นำเข้า axios สำหรับสร้าง HTTP client
import axios from "axios";
// นำเข้า Redux store เพื่ออ่าน accessToken จาก memory (ไม่ใช้ localStorage)
import { store } from "../store/store";
// นำเข้า thunk สำหรับ refresh token และ logout
import { refreshTokenThunk, logoutThunk } from "../store/auth.store";

// สร้าง axios instance แยกต่างหากเพื่อกำหนด baseURL และ header เริ่มต้น
const api = axios.create({
  // ใช้ค่า env VITE_API_URL ถ้ามี ไม่ก็ fallback เป็น localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  // กำหนด Content-Type เป็น JSON เป็น default (อาจถูก override เมื่อส่ง FormData)
  headers: { "Content-Type": "application/json" },
  withCredentials: true, //  สำคัญมาก! ให้ browser ส่ง HttpOnly Cookie ไปด้วยทุก request
});

//  อ่าน accessToken จาก Redux store (memory) แทน localStorage
// interceptor นี้จะทำงานก่อนทุก request — ถ้ามี token ให้แนบ Authorization header
api.interceptors.request.use((config) => {
  // ดึง accessToken จาก Redux state ปัจจุบัน
  const token = store.getState().auth.accessToken;
  // ถ้ามี token ให้ใส่ใน header เป็น Bearer token
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// flag บอกว่าขณะนี้กำลัง refresh token อยู่หรือไม่ (ป้องกัน refresh ซ้อนกัน)
let isRefreshing = false;
// คิว request ที่รอ token ใหม่อยู่ขณะที่กำลัง refresh
let failedQueue: Array<{
  resolve: (token: string) => void; // เรียกเมื่อได้ token ใหม่แล้ว
  reject: (err: any) => void;       // เรียกเมื่อ refresh ล้มเหลว
}> = [];

// ฟังก์ชันประมวลผล request ที่ค้างอยู่ในคิว
// ถ้ามี token → resolve ทุกรายการ, ถ้าไม่มี (error) → reject ทุกรายการ
const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  // ล้างคิวหลังประมวลผลเสร็จ
  failedQueue = [];
};

//  silent refresh อัตโนมัติเมื่อ accessToken หมดอายุ (401)
api.interceptors.response.use(
  // ถ้า response สำเร็จ ให้ส่งต่อตามปกติ
  (response) => response,
  async (error) => {
    // เก็บ config ของ request เดิมไว้สำหรับส่งซ้ำหลังได้ token ใหม่
    const originalRequest = error.config;

    // ตรวจสอบว่า request นี้เป็น endpoint auth หรือไม่ (เช่น /auth/login, /auth/refresh)
    // เพื่อหลีกเลี่ยงการ refresh token วนซ้ำ
    const isAuthEndpoint = originalRequest.url?.includes("/auth/");
    // เงื่อนไข: error เป็น 401, ยังไม่เคย retry, และไม่ใช่ auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // มี request อื่นกำลัง refresh อยู่ → รอใน queue
        // สร้าง Promise ที่จะ resolve เมื่อ refresh เสร็จ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          // ใส่ token ใหม่ใน header แล้วส่ง request เดิมซ้ำ
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      // ทำเครื่องหมายว่า request นี้ได้ retry แล้ว (ป้องกัน loop)
      originalRequest._retry = true;
      // ตั้ง flag ว่ากำลัง refresh อยู่
      isRefreshing = true;

      try {
        // dispatch thunk เพื่อขอ token ใหม่จาก backend ผ่าน HttpOnly Cookie
        const result = await store.dispatch(refreshTokenThunk());

        // ถ้า refresh สำเร็จ
        if (refreshTokenThunk.fulfilled.match(result)) {
          const newToken = result.payload.accessToken;
          // ประมวลผลคิวทั้งหมดด้วย token ใหม่
          processQueue(null, newToken);
          // ใส่ token ใหม่ใน request เดิมแล้วส่งซ้ำ
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // refresh ไม่ได้ด้วยเหตุผลอื่น
          throw new Error("Refresh failed");
        }
      } catch (err) {
        // reject คิวทั้งหมดเพราะ refresh ล้มเหลว
        processQueue(err, null);
        // refresh ไม่ได้ → logout และ redirect ไป login
        await store.dispatch(logoutThunk());
        // บังคับ redirect ออกจากหน้าปัจจุบัน
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        // ล้าง flag isRefreshing ไม่ว่าจะสำเร็จหรือล้มเหลว
        isRefreshing = false;
      }
    }

    // ถ้าไม่ใช่ 401 หรือ retry แล้ว ให้ส่ง error ต่อไปตามปกติ
    return Promise.reject(error);
  }
);

// export api instance เพื่อให้ไฟล์อื่นนำไปใช้
export default api;
