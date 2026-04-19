// Landing page — redirect อัตโนมัติ: login แล้ว→/home, ยังไม่ login→แสดง Login/Register button
//
// หลักการทำงาน:
// 1. AuthGuard ใน _layout.tsx จะ redirect ผู้ใช้ที่ login แล้วออกจากหน้านี้ไป /home อัตโนมัติ
// 2. ถ้าไม่ได้ login: แสดง logo animation (stagger: logo→tagline→buttons) และปุ่ม Register/Login
// 3. Animation: Animated.stagger 180ms → fade + slide-up ทีละส่วน

// นำเข้า React และ hooks ที่จำเป็น
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,       // ใช้สำหรับ animation (fade, slide)
  Dimensions,     // ดึงขนาดหน้าจอ (width/height)
} from "react-native";
// นำเข้า router จาก expo-router สำหรับ navigate ไปหน้าอื่น
import { router } from "expo-router";

// ดึงขนาดหน้าจอ (ใช้ width/height ถ้าต้องการ responsive layout)
const { width, height } = Dimensions.get("window");

// ─── Dot badge ───────────────────────────────────────────────────────────────
// Component จุดสีเขียวสามจุดที่แสดงข้างโลโก้ "Musicky" เป็น visual identity
const Dots = () => (
  // วาง 3 จุดแนวนอน โดยใช้ flex-row และ gap 4
  <View className="flex-row items-center ml-2" style={{ gap: 4 }}>
    {/* จุดที่ 1: สีเขียวเข้มสุด (ขนาดเล็ก) */}
    <View className="w-3 h-3 rounded-full bg-green-800" />
    {/* จุดที่ 2: สีเขียวกลาง (ขนาดเล็ก) */}
    <View className="w-3 h-3 rounded-full bg-green-700" />
    {/* จุดที่ 3: สีเขียวสว่างที่สุด (ขนาดใหญ่กว่า) — เน้นให้เด่น */}
    <View className="w-4 h-4 rounded-full bg-green-500" />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
// WelcomeScreen คือหน้าแรกของแอป แสดงโลโก้ + ปุ่ม Register/Login
// AuthGuard ใน _layout.tsx จะ redirect ผู้ใช้ที่ login แล้วไป /home โดยอัตโนมัติ
export default function WelcomeScreen() {
  // Animated.Value(0) → ค่าเริ่มต้น 0 (opacity เริ่มที่ 0 = มองไม่เห็น)
  const logoAnim = useRef(new Animated.Value(0)).current;      // ควบคุม opacity ของโลโก้
  const taglineAnim = useRef(new Animated.Value(0)).current;   // ควบคุม opacity ของ tagline
  const buttonsAnim = useRef(new Animated.Value(0)).current;   // ควบคุม opacity ของปุ่ม
  const translateY = useRef(new Animated.Value(30)).current;   // ควบคุม slide-up ของ tagline (เริ่มต่ำลง 30)

  // ทำ animation เมื่อ component mount ครั้งแรก
  useEffect(() => {
    // Animated.stagger: รัน animation ทีละตัวโดยห่างกัน 180ms
    Animated.stagger(180, [
      // 1) Fade in โลโก้ใน 700ms
      Animated.timing(logoAnim, {
        toValue: 1,       // opacity → 1 (มองเห็น)
        duration: 700,
        useNativeDriver: true, // ใช้ native driver ทำให้ smooth
      }),
      // 2) Fade in tagline พร้อมกับ slide-up ใน 600ms
      Animated.parallel([
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // slide-up: translateY จาก 30 → 0 (เลื่อนขึ้น)
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 3) Fade in ปุ่มใน 500ms (แสดงหลังสุด)
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(); // เริ่ม animation
  }, []); // [] = ทำงานครั้งเดียวตอน mount

  return (
    // พื้นหลังสีดำเข้ม (#111111) ใช้พื้นที่เต็มหน้าจอ
    <View className="flex-1 bg-[#111111]">
      {/* StatusBar สีขาวบนพื้นหลังมืด */}
      <StatusBar barStyle="light-content" backgroundColor="#111111" />


      {/* ── Logo ── */}
      {/* Animated.View ใช้ opacity จาก logoAnim เพื่อ fade in โลโก้
          paddingHorizontal: 24 และ marginTop: 32 ให้ระยะจากขอบ */}
      <Animated.View style={{ opacity: logoAnim, paddingHorizontal: 24, marginTop: 32 }}>
        {/* วาง "Musicky" text + dot badge แนวนอน ตรงกลาง บน 1/3 ของหน้า */}
        <View className="flex-row mt-28 items-center justify-center">
          {/* ชื่อแอป ตัวใหญ่ สีขาว */}
          <Text className="text-white text-5xl font-bold">Musicky</Text>
          {/* จุดสีเขียวประกอบโลโก้ */}
          <Dots />
        </View>
      </Animated.View>

      {/* ── Tagline ── */}
      {/* Animated.View ควบคุมทั้ง opacity (taglineAnim) และ translateY (slide-up)
          flex: 1 ให้ tagline ขยายพื้นที่กลาง, justifyContent: "flex-end" ดัน text ลงล่าง */}
      <Animated.View
        style={{
          opacity: taglineAnim,
          transform: [{ translateY }], // slide-up effect
          flex: 1,
          justifyContent: "flex-end", // ดัน text ไปติดขอบล่างของ flex area
          paddingHorizontal: 24,
          paddingBottom: 20,
        }}
      >
        {/* Tagline สั้น "Just keep" — สีเทา น้ำหนักเบา tracking กว้าง ตรงกลาง */}
        <Text className="text-gray-400 text-lg font-light tracking-wide text-center mb-16">
          Just keep
        </Text>
      </Animated.View>

      {/* ── Buttons ── */}
      {/* Animated.View fade in ปุ่มทั้งสองหลังสุด
          paddingBottom: 40 + marginBottom: 160 ให้ปุ่มอยู่เหนือ bottom (ไม่ชนขอบ) */}
      <Animated.View
        style={{
          opacity: buttonsAnim,
          paddingHorizontal: 20,
          paddingBottom: 40,
          marginBottom: 160,
        }}
      >
        {/* ปุ่ม Register — พื้นหลังเทาอ่อน (#d4d4d4) ตัวอักษรดำ */}
        <TouchableOpacity
          className="bg-[#d4d4d4] rounded-full py-4 items-center mb-3"
          activeOpacity={0.85}  // ลด opacity เมื่อกด
          onPress={() => router.push("/register")} // ไปหน้า register
        >
          <Text className="text-black font-semibold text-base tracking-wide">
            Register
          </Text>
        </TouchableOpacity>

        {/* ปุ่ม Log In — แบบ outline สีเทาอ่อน ไม่มีพื้นหลัง */}
        <TouchableOpacity
          className="border border-gray-600 rounded-full py-4 items-center"
          activeOpacity={0.85}
          onPress={() => router.push("/login")} // ไปหน้า login
        >
          <Text className="text-gray-300 text-base font-semibold tracking-wide">Log in</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
