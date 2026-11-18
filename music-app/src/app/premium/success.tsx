import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";

const CrownIcon = () => (
  <Svg width={52} height={52} viewBox="0 0 24 24">
    <Path fill="#FFD700" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2 3h10v2H7v-2z" />
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width={64} height={64} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill="#16a34a" />
    <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

const BenefitRow = ({ label }: { label: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="#16a34a" />
      <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </Svg>
    <Text style={{ color: "#ddd", fontSize: 14 }}>{label}</Text>
  </View>
);

export default function PaymentSuccessScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const BENEFITS = [
    "คุณภาพเสียงสูงสุด HD (1411 kbps)",
    "ดาวน์โหลดฟังออฟไลน์ไม่จำกัด",
    "สตรีมคุณภาพ 320 kbps",
    "ไม่มีโฆษณาระหว่างเพลง",
    "ข้ามเพลงได้ไม่จำกัด",
    "ดูเนื้อเพลง Real-time",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0d0020", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: "center" }}>
        <CheckCircleIcon />
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 16, textAlign: "center" }}>
          ชำระเงินสำเร็จ!
        </Text>
        <Text style={{ color: "#888", fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
          ขอบคุณสำหรับการสมัคร Musicky Premium{"\n"}กำลังตรวจสอบ อาจใช้เวลา 5–30 นาที
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, width: "100%", marginTop: 32 }}>
        {/* Premium badge */}
        <View
          style={{
            backgroundColor: "#1a0a3b",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#7c3aed",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <CrownIcon />
          <Text style={{ color: "#FFD700", fontSize: 15, fontWeight: "700", marginTop: 8 }}>
            Musicky Premium
          </Text>
          <Text style={{ color: "#a78bfa", fontSize: 13, marginTop: 4 }}>
            Active — รายเดือน
          </Text>
        </View>

        {/* Benefits */}
        <View
          style={{
            backgroundColor: "#161616",
            borderRadius: 16,
            padding: 16,
            marginBottom: 28,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", marginBottom: 4 }}>สิทธิประโยชน์ที่คุณได้รับ</Text>
          {BENEFITS.map((b) => (
            <BenefitRow key={b} label={b} />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#7c3aed",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>เริ่มต้นใช้งาน Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          activeOpacity={0.7}
          style={{ alignItems: "center", paddingVertical: 12 }}
        >
          <Text style={{ color: "#7c3aed", fontSize: 14 }}>ดูสถานะการชำระเงิน</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
