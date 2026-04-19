// Axios instance กลางของ music-app — ตั้ง baseURL, header Authorization | interceptor: แนบ access token ทุก request, refresh token อัตโนมัติเมื่อ 401, logout เมื่อ refresh หมด
//
// หลักการทำงาน:
// 1. สร้าง axios instance พร้อม baseURL, timeout 12s, Content-Type JSON
// 2. Request interceptor: ตรวจ cachedToken ใน memory → ถ้าไม่มี ดึงจาก AsyncStorage → แนบ Authorization header
// 3. Response interceptor - 401 handling:
//    - ถ้ากำลัง refresh: เพิ่ม request เข้าคิว (pendingQueue) รอ token ใหม่
//    - ถ้ายังไม่ refresh: ดึง refreshToken จาก AsyncStorage → POST /auth/refresh → อัปเดต token → retry request เดิม + flush queue
//    - ถ้า refresh ล้มเหลว: flush queue ด้วย error, ล้าง token, ลบ AsyncStorage keys
// 4. Timeout retry: ถ้า error code ECONNABORTED → รอ 800ms → retry ครั้งเดียว

// นำเข้า axios สำหรับสร้าง HTTP client
import axios from "axios";

// นำเข้า AsyncStorage สำหรับเก็บ/อ่านข้อมูลบน device (เช่น token)
import AsyncStorage from "@react-native-async-storage/async-storage";

// ฟังก์ชันอ่าน base URL จาก environment variable
// หากไม่มีค่า EXPO_PUBLIC_API_URL จะใช้ localhost เป็น fallback
const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api";
};

// เก็บ base URL ไว้ใน constant เพื่อใช้ซ้ำได้ทั้งไฟล์
const BASE_URL = getBaseUrl();

// Cache token ไว้ใน memory เพื่อไม่ต้องอ่าน AsyncStorage ทุก request
// ช่วยลด latency และลดภาระ I/O บน device
let cachedToken: string | null = null;

// ฟังก์ชัน setter สำหรับอัปเดต cachedToken จากภายนอก
// เรียกใช้ตอน login สำเร็จ หรือ logout เพื่อล้าง token ออกจาก cache
export const setCachedToken = (token: string | null) => {
  cachedToken = token;
};

// สร้าง axios instance พร้อม config เริ่มต้น
// baseURL: ที่อยู่ API หลัก
// timeout: หมดเวลาที่ 12 วินาที เพื่อไม่ให้ request ค้างนานเกินไป
// headers: ส่ง Content-Type เป็น JSON ทุก request
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: แนบ access token ทุก request ─────────────────────────────────
// interceptor นี้ทำงานก่อนที่ทุก request จะถูกส่ง
// ตรวจสอบว่ามี token ใน memory cache หรือไม่
// ถ้าไม่มีให้ดึงจาก AsyncStorage แล้ว cache ไว้
// เมื่อมี token แล้วแนบใน Authorization header แบบ Bearer
apiClient.interceptors.request.use(async (config) => {
  if (!cachedToken) {
    // ยังไม่มี token ใน memory → ดึงจาก AsyncStorage
    cachedToken = await AsyncStorage.getItem("accessToken");
  }
  if (cachedToken) {
    // มี token → แนบเข้า header ทุก request
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

// ─── Response interceptor: รีเฟรช token อัตโนมัติเมื่อได้รับ 401 ───────────────────────────
// flag บอกว่ากำลัง refresh token อยู่หรือไม่ (ป้องกัน refresh ซ้อน)
let isRefreshing = false;
// คิวของ request ที่รอผล refresh token อยู่
// resolve: เรียกเมื่อ refresh สำเร็จ, reject: เรียกเมื่อ refresh ล้มเหลว
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

// ฟังก์ชัน flush คิว: ส่ง token ใหม่ให้ทุก request ที่รออยู่ (กรณีสำเร็จ)
// หรือ reject ทุก request ในคิว (กรณีล้มเหลว)
const flushQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  // response ปกติ (status 2xx) → ส่งผ่านโดยไม่แก้ไข
  (response) => response,
  async (error) => {
    // เก็บ config ของ request เดิมไว้เพื่อ retry ภายหลัง
    const original = error.config;

    // ตรวจว่าเป็น error จาก timeout หรือไม่
    // ECONNABORTED คือ code ของ axios เมื่อ request หมดเวลา
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    if (isTimeout && !original._timeoutRetried) {
      // retry ครั้งเดียวเมื่อ timeout โดยรอ 800ms ก่อน
      // ใช้ flag _timeoutRetried ป้องกันการ retry ซ้ำซ้อน
      original._timeoutRetried = true;
      await new Promise((res) => setTimeout(res, 800));
      return apiClient(original);
    }

    // จัดการเฉพาะ status 401 (Unauthorized)
    // ข้าม: ถ้าไม่ใช่ 401, ถ้าเคย retry แล้ว, หรือถ้าเป็น request ไป /auth/refresh (ป้องกัน loop)
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // กำลัง refresh อยู่ → เพิ่ม request นี้เข้าคิวรอ
      // เมื่อ refresh สำเร็จ จะเรียก resolve พร้อม token ใหม่ แล้ว retry request นี้
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    // ตั้ง flag ว่า request นี้ได้ retry แล้ว (ป้องกัน 401 loop)
    original._retry = true;
    // ตั้ง flag ว่ากำลัง refresh token (ป้องกัน refresh ซ้อน)
    isRefreshing = true;

    try {
      // อ่าน refresh token จาก AsyncStorage
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      // เรียก endpoint refresh token โดยใช้ axios ตรง (ไม่ผ่าน apiClient)
      // เพื่อหลีกเลี่ยง interceptor loop
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      // รองรับทั้งรูปแบบ data.data.accessToken และ data.accessToken
      const newAccessToken: string = data.data?.accessToken ?? data.accessToken;
      // บันทึก token ใหม่ลง AsyncStorage
      await AsyncStorage.setItem("accessToken", newAccessToken);
      // อัปเดต memory cache ด้วย token ใหม่
      setCachedToken(newAccessToken);

      // อัปเดต default header และ header ของ request เดิม
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      original.headers.Authorization = `Bearer ${newAccessToken}`;

      // แจ้ง request ทั้งหมดในคิวว่า refresh สำเร็จ พร้อม token ใหม่
      flushQueue(newAccessToken);
      // retry request เดิมที่ 401 ด้วย token ใหม่
      return apiClient(original);
    } catch (refreshError) {
      // refresh ล้มเหลว → reject ทุก request ในคิว
      flushQueue(null, refreshError);
      // ล้าง session ออกจาก memory และ storage → ผู้ใช้ต้อง login ใหม่
      setCachedToken(null);
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      return Promise.reject(refreshError);
    } finally {
      // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้ reset flag isRefreshing เสมอ
      isRefreshing = false;
    }
  }
);

// export apiClient เป็น default เพื่อให้ไฟล์อื่น import ไปใช้งาน
export default apiClient;
