// Wrapper ตรวจสอบว่า expo-audio native module พร้อมใช้ — ถ้าไม่พร้อม fallback เป็น null (ไม่ crash) | mount เป็น global component ใน _layout.tsx
//
// หลักการทำงาน:
// 1. ใช้ try/catch require("expo-audio") เพื่อตรวจสอบว่า native module พร้อมหรือไม่
// 2. ถ้าพร้อม: โหลด AudioControllerImpl และเก็บไว้ใน Impl variable
// 3. ถ้าไม่พร้อม: แสดง console.warn และ Impl เป็น null
// 4. Component export: ถ้า Impl เป็น null → return null (ไม่ crash), ถ้าพร้อม → render Impl
// 5. pattern นี้ทำให้ app เปิดได้บน simulator ที่ยังไม่ได้ build native module

// AudioController — wraps AudioControllerImpl ซึ่งใช้ expo-audio
// ถ้า expo-audio ยังไม่ได้ build เข้า native จะ fallback เป็น null (ไม่ crash)

// ตัวแปรสำหรับเก็บ Component จริง — ตั้งเป็น null ก่อนเผื่อ native module ยังไม่พร้อม
let Impl: React.ComponentType | null = null;
try {
  require("expo-audio"); // ทดสอบว่า native module ของ expo-audio พร้อมใช้งานหรือไม่
  Impl = require("./AudioControllerImpl").default; // โหลด implementation จริงถ้า module พร้อม
} catch {
  // แจ้งเตือน developer ในกรณีที่ expo-audio ยังไม่ได้ build ลงเครื่อง
  console.warn("AudioController: expo-audio not available — run `npx expo run:android`");
}

// Component หลักที่ render ตัว implementation — ถ้า Impl เป็น null จะ return null เพื่อไม่ให้ app crash
export default function AudioController() {
  if (!Impl) return null; // ป้องกัน crash เมื่อ native module ไม่พร้อม
  return <Impl />; // render AudioControllerImpl เมื่อพร้อม
}
