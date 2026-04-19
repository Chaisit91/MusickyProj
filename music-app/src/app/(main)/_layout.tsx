// Layout หน้าหลัก — ครอบ Topbar + Bottomnav + Stack navigator สำหรับ home, search, library pages
//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ (main) group: home, search, library ฯลฯ
// 2. headerShown: false — แต่ละหน้าจัดการ header เอง

import { Stack } from "expo-router";

// ─── Main Layout ──────────────────────────────────────────────────────────────
// Covers: /home, /search, /your-library, /downloads,
//         /liked-songs, /recently-played, /playlists, /artist-following
// Auth guard (guest → /login) is handled by the root _layout.tsx AuthGuard.
export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 280,
      }}
    />
  );
}
