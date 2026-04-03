import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

// ─── Dot badge ───────────────────────────────────────────────────────────────
const Dots = () => (
  <View className="flex-row items-center ml-2" style={{ gap: 4 }}>
    <View className="w-3 h-3 rounded-full bg-green-800" />
    <View className="w-3 h-3 rounded-full bg-green-700" />
    <View className="w-4 h-4 rounded-full bg-green-500" />
  </View>
);

// ─── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <View style={{ marginRight: 10 }}>
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.8l6.2 5.2C41.3 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z" />
    </Svg>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-[#111111]">
      <StatusBar barStyle="light-content" backgroundColor="#111111" />


      {/* ── Logo ── */}
      <Animated.View style={{ opacity: logoAnim, paddingHorizontal: 24, marginTop: 32 }}>
        <View className="flex-row mt-28 items-center justify-center">
          <Text className="text-white text-5xl font-bold">Musicky</Text>
          <Dots />
        </View>
      </Animated.View>

      {/* ── Tagline ── */}
      <Animated.View
        style={{
          opacity: taglineAnim,
          transform: [{ translateY }],
          flex: 1,
          justifyContent: "flex-end",
          paddingHorizontal: 24,
          paddingBottom: 20,
        }}
      >
        <Text className="text-gray-400 text-lg font-light tracking-wide text-center mb-16">
          Just keep
        </Text>
      </Animated.View>

      {/* ── Buttons ── */}
      <Animated.View
        style={{
          opacity: buttonsAnim,
          paddingHorizontal: 20,
          paddingBottom: 40,
          marginBottom: 160,
        }}
      >
        {/* Register */}
        <TouchableOpacity
          className="bg-[#d4d4d4] rounded-full py-4 items-center mb-3"
          activeOpacity={0.85}
          onPress={() => router.push("/register")}
        >
          <Text className="text-black font-semibold text-base tracking-wide">
            Register
          </Text>
        </TouchableOpacity>

        {/* Continue with Google */}
        <TouchableOpacity
          className="border border-gray-600 rounded-full py-4 flex-row items-center justify-center mb-4"
          activeOpacity={0.85}
          onPress={() => router.push("/register")}
        >
          <GoogleIcon />
          <Text className="text-white font-medium text-base">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Log In */}
        <TouchableOpacity
          className="border border-gray-600 rounded-full py-4 items-center"
          activeOpacity={0.85}
          onPress={() => router.push("/login")}
        >
          <Text className="text-gray-300 text-base font-semibold tracking-wide">Log in</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}