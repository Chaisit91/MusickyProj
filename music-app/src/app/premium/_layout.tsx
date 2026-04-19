// Layout สำหรับหน้า premium
//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ premium flow: index, payment, success
// 2. headerShown: false

import { Stack } from "expo-router";

export default function PremiumLayout() {
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
