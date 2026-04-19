// Layout สำหรับ auth group — Stack navigator สำหรับหน้า login, register, forgot-password, set-username
//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ (auth) group: login, register, set-username
// 2. headerShown: false ซ่อน header ทุกหน้าใน group นี้

import { Stack } from "expo-router";

// ─── Auth Layout ──────────────────────────────────────────────────────────────
// Covers: /login, /register
// Auth redirect (already logged-in → /home) is handled by the root _layout.tsx AuthGuard.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
