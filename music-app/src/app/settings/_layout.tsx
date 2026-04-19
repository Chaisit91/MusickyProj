// Layout สำหรับหน้า settings
//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ settings: index, edit-profile, help-support
// 2. headerShown: false

import { Stack } from "expo-router";

export default function SettingsLayout() {
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
