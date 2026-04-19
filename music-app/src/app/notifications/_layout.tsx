// Layout สำหรับหน้า notifications
//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ notifications group
// 2. headerShown: false

import { Stack } from "expo-router";

export default function NotificationsLayout() {
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
