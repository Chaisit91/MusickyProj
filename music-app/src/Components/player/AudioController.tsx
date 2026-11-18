// AudioController — wraps AudioControllerImpl ซึ่งใช้ expo-audio
// ถ้า expo-audio ยังไม่ได้ build เข้า native จะ fallback เป็น null (ไม่ crash)

let Impl: React.ComponentType | null = null;
try {
  require("expo-audio"); // ทดสอบว่า native module พร้อม
  Impl = require("./AudioControllerImpl").default;
} catch {
  console.warn("AudioController: expo-audio not available — run `npx expo run:android`");
}

export default function AudioController() {
  if (!Impl) return null;
  return <Impl />;
}
