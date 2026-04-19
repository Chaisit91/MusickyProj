// Constants ของแอพ — colorFor(index): สีพื้นหลัง album art ตาม index, ค่าคงที่ทั่วไปที่ใช้ร่วมกันทั้งแอพ
//
// หลักการทำงาน:
// 1. FALLBACK_COLORS: array สี 8 สีสำหรับใช้เป็น fallback background เมื่อไม่มี album art
// 2. colorFor(i): คืนสีตาม index แบบ circular (i % FALLBACK_COLORS.length) ทำให้ทุก item มีสีไม่ซ้ำกัน

export const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];

export const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];
