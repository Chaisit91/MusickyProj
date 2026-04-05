import { Stack } from "expo-router";

// ─── Main Layout ──────────────────────────────────────────────────────────────
// Covers: /home, /search, /your-library, /downloads,
//         /liked-songs, /recently-played, /playlists, /artist-following
// Auth guard (guest → /login) is handled by the root _layout.tsx AuthGuard.
export default function MainLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
