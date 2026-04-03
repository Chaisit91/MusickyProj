import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

const BellIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      stroke="#ffffff"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CrownIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path fill="#FFD700" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2 3h10v2H7v-2z" />
  </Svg>
);

interface TopBarProps {
  username?: string;
  onPremiumPress?: () => void;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
}

export default function TopBar({
  username = "User",
  onPremiumPress,
  onBellPress,
  onAvatarPress,
}: TopBarProps) {
  // Show first character of name as avatar initial
  const initial = username.charAt(0).toUpperCase();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
      }}
    >
      <View>
        <Text style={{ fontSize: 18, color: "#fff" }}>
          👋 <Text style={{ fontWeight: "700" }}>Hi {username},</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPremiumPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1e293b",
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            marginTop: 6,
            gap: 5,
            alignSelf: "flex-start",
          }}
        >
          <CrownIcon />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            Get Premium
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBellPress}>
          <BellIcon />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={onAvatarPress}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#5b4fcf",
              borderWidth: 2,
              borderColor: "#444",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {initial}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
