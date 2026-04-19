// Wrapper ทำ fade-in animation — ใช้ Animated.Value + timing เมื่อ component mount | ใช้ครอบ content ที่ต้องการ animate เข้ามา
//
// หลักการทำงาน:
// 1. ใช้ useSharedValue สำหรับ opacity (เริ่มที่ 0) และ translateY (เริ่มที่ fromY)
// 2. useEffect mount: ถ้ามี delay → setTimeout แล้วค่อย animate, ไม่มี delay → animate ทันที
// 3. animate opacity 0→1 และ translateY fromY→0 พร้อมกันด้วย withTiming (Easing.out.quad)
// 4. useAnimatedStyle ส่ง style ที่ประกอบ opacity + translateY ให้ Animated.View

import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface FadeInViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  delay?: number;
  duration?: number;
  fromY?: number;
}

export default function FadeInView({
  children,
  style,
  delay = 0,
  duration = 320,
  fromY = 14,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(fromY);

  useEffect(() => {
    const easing = Easing.out(Easing.quad);
    if (delay > 0) {
      const timer = setTimeout(() => {
        opacity.value = withTiming(1, { duration, easing });
        translateY.value = withTiming(0, { duration, easing });
      }, delay);
      return () => clearTimeout(timer);
    }
    opacity.value = withTiming(1, { duration, easing });
    translateY.value = withTiming(0, { duration, easing });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}
