import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
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

const StorageIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#e84393" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
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
  { label: "Normal", sublabel: "ประหยัดพื้นที่", bitrate: "96 kbps", size: "~4 MB/เพลง" },
  {
    label: "High",
    sublabel: "คุณภาพดีขึ้น",
    bitrate: "320 kbps",
    size: "~9 MB/เพลง",
    premium: true,
  },
  {
    label: "Very High (Lossless)",
    sublabel: "คุณภาพไม่สูญเสีย",
    bitrate: "1.4 AC, 1411 kbps",
    size: "~30 MB/เพลง",
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

export default function DownloadQualityScreen() {
  const [selected, setSelected] = useState("High");
  const usedGB = 2.4;
  const totalGB = 32;
  const usedPct = (usedGB / totalGB) * 100;

  useEffect(() => {
    AsyncStorage.getItem("pref_downloadQuality").then((v) => {
      if (v) setSelected(v);
    });
  }, []);

  const handleSelect = async (label: string) => {
    setSelected(label);
    await AsyncStorage.setItem("pref_downloadQuality", label);
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
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Download Quality</Text>
            <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>คุณภาพการดาวน์โหลด</Text>
          </View>
        </View>

        {/* Storage card */}
        <View
          style={{
            backgroundColor: "#2a1030",
            marginHorizontal: 16,
            marginVertical: 16,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <StorageIcon />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>พื้นที่จัดเก็บ</Text>
              <Text style={{ color: "#e84393", fontSize: 12, marginTop: 2 }}>อุปกรณ์นี้</Text>
            </View>
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {usedGB.toFixed(1)} GB / {totalGB} GB
            </Text>
          </View>
          {/* Progress bar */}
          <View style={{ backgroundColor: "#1a1a1a", borderRadius: 4, height: 6 }}>
            <View
              style={{
                backgroundColor: "#e84393",
                borderRadius: 4,
                height: 6,
                width: `${usedPct}%`,
              }}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              marginTop: 14,
              backgroundColor: "#3a1040",
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path fill="#e84393" d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </Svg>
            <Text style={{ color: "#e84393", fontWeight: "600", fontSize: 13 }}>ลบเพลงที่ดาวน์โหลด</Text>
          </TouchableOpacity>
        </View>

        {/* Quality section title */}
        <Text style={{ color: "#888", fontSize: 13, fontWeight: "600", paddingHorizontal: 20, marginBottom: 12 }}>
          คุณภาพการดาวน์โหลด
        </Text>

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path fill="#888" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </Svg>
            <Text style={{ color: "#888", fontSize: 13, fontWeight: "600" }}>ขนาดไฟล์โดยประมาณ</Text>
          </View>
          {[
            "เพลง 100 เพลง ที่ 320 kbps = 800 MB",
            "อัลบัม 1 อัลบัม (12 เพลง) ที่ Lossless = 360 MB",
          ].map((txt, i) => (
            <Text key={i} style={{ color: "#666", fontSize: 12, marginBottom: 6, lineHeight: 18 }}>
              • {txt}
            </Text>
          ))}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 6,
              marginTop: 8,
              backgroundColor: "#1a1a1a",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text style={{ color: "#f59e0b", fontSize: 12 }}>
              ⚠️ ไฟล์ Lossless จะมีขนาดใหญ่กว่ามากและต้องการพื้นที่จัดเก็บสูง
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
