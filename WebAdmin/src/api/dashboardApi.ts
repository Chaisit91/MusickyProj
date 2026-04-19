// API ดึงสถิติ dashboard — total users, premium users, total songs, total revenue, กราฟรายได้รายเดือน

// นำเข้า axios instance ที่กำหนดค่าไว้แล้ว
import api from "./axios";

// ดึงข้อมูลสรุปภาพรวมของระบบสำหรับหน้า Dashboard
// endpoint: GET /admin/dashboard
// return: { stats, activities, topSongs, userGrowth, playGrowth }
//   - stats: ตัวเลขสรุป (ผู้ใช้, เพลง, การเล่น, รายได้ ฯลฯ)
//   - activities: กิจกรรมล่าสุดในระบบ
//   - topSongs: เพลงที่มียอดเล่นสูงสุด
//   - userGrowth: ข้อมูลการเติบโตของผู้ใช้รายเดือน
//   - playGrowth: ข้อมูลการเติบโตของยอดเล่นรายเดือน
export const getDashboardApi = async () => {
  return api.get("/admin/dashboard");
};
