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
