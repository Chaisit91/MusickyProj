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
