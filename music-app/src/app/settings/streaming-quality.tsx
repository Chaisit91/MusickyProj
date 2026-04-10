import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

const WifiIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#7c3aed"
      d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"
    />
  </Svg>
);

interface QualityOption {
  label: string;
  sublabel: string;
  bitrate: string;
  size: string;
  premium?: boolean;
}

const OPTIONS: QualityOption[] = [
  { label: "Low", sublabel: "ประหยัดข้อมูลมือถือ", bitrate: "~96 kbps", size: "~43 MB/hr" },
  { label: "Normal", sublabel: "คุณภาพทั่วไป", bitrate: "~160 kbps", size: "~72 MB/hr" },
  {
    label: "High",
    sublabel: "คุณภาพเสียงสูง",
    bitrate: "320 kbps",
    size: "~144 MB/hr",
    premium: true,
  },
  {
    label: "Very High (HD)",
    sublabel: "คุณภาพสูงสุด",
    bitrate: "1411 kbps",
    size: "~520 MB/hr",
    premium: true,
  },
];

const PremiumBadge = () => (
  <View
    style={{
      backgroundColor: "#4a1a7a",
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 6,
    }}
  >
    <Text style={{ color: "#c084fc", fontSize: 10, fontWeight: "700" }}>PREMIUM</Text>
  </View>
);

export default function StreamingQualityScreen() {
  const [selected, setSelected] = useState("Low");

  useEffect(() => {
    AsyncStorage.getItem("pref_streamingQuality").then((v) => {
      if (v) setSelected(v);
    });
  }, []);

  const handleSelect = async (label: string) => {
    setSelected(label);
    await AsyncStorage.setItem("pref_streamingQuality", label);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginRight: 16 }}>
            <BackIcon />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Streaming Quality</Text>
            <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>คุณภาพการสตรีมเพลง</Text>
          </View>
        </View>

        {/* WiFi note */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#1a1240",
            marginHorizontal: 16,
            marginVertical: 16,
            borderRadius: 12,
            padding: 14,
          }}
        >
          <WifiIcon />
          <Text style={{ color: "#a78bfa", fontSize: 13, flex: 1, lineHeight: 18 }}>
            ใช้ข้อมูลอย่างรอบคอบ{"\n"}คุณภาพสูงใช้ข้อมูลมือถือมากกว่า แนะนำให้ใช้ Wi-Fi สำหรับคุณภาพสูง
          </Text>
        </View>

        {/* Options */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.label;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => handleSelect(opt.label)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isSelected ? "#3b1f6e" : "#1e1e1e",
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: isSelected ? 1.5 : 0,
                  borderColor: isSelected ? "#7c3aed" : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{opt.label}</Text>
                    {opt.premium && <PremiumBadge />}
                  </View>
                  <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>{opt.sublabel}</Text>
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                    <Text style={{ color: "#666", fontSize: 11 }}>{opt.bitrate}</Text>
                    <Text style={{ color: "#666", fontSize: 11 }}>{opt.size}</Text>
                  </View>
                </View>
                {isSelected && <CheckIcon />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Data usage info */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path fill="#888" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </Svg>
            <Text style={{ color: "#888", fontSize: 13, fontWeight: "600" }}>การใช้ข้อมูลโดยประมาณ</Text>
          </View>
          {[
            "1 เพลง (3.5 นาที) ที่ 160 kbps = 3.6 MB",
            "1 อัลบัม ที่ 320 kbps = 144 MB",
            "10 ชั่วโมง ที่ HD = 5.3 GB",
          ].map((txt, i) => (
            <Text key={i} style={{ color: "#666", fontSize: 12, marginBottom: 6, lineHeight: 18 }}>
              • {txt}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
