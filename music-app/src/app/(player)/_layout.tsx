// Layout สำหรับ player group — Modal-style Stack navigator สำหรับ player.tsx และ queue.tsx
//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ (player) group: player, queue
// 2. headerShown: false

import { Stack } from "expo-router";

// ─── Player Layout ────────────────────────────────────────────────────────────
export default function PlayerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_bottom",
        animationDuration: 380,
        gestureEnabled: true,
        gestureDirection: "vertical",
      }}
    />
  );
}
