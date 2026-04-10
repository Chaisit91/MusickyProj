import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
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