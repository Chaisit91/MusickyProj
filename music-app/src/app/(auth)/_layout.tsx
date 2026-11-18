import { Stack } from "expo-router";

// ─── Auth Layout ──────────────────────────────────────────────────────────────
// Covers: /login, /register
// Auth redirect (already logged-in → /home) is handled by the root _layout.tsx AuthGuard.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
