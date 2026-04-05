import { Stack } from "expo-router";

// ─── Player Layout ────────────────────────────────────────────────────────────
// Covers: /player, /queue
// Auth guard (guest → /login) is handled by the root _layout.tsx AuthGuard.
export default function PlayerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
