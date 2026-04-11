import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
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

const GearIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke="#ffffff"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
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
  avatarUrl?: string | null;
  isPremium?: boolean;
  unreadCount?: number;
  onPremiumPress?: () => void;
  onBellPress?: () => void;
  onSettingsPress?: () => void;
  onAvatarPress?: () => void;
}

export default function TopBar({
  username = "User",
  avatarUrl,
  isPremium = false,
  unreadCount = 0,
  onPremiumPress,
  onBellPress,
  onSettingsPress,
  onAvatarPress,
}: TopBarProps) {
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
            backgroundColor: isPremium ? "#1a3a1a" : "#1e293b",
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            marginTop: 6,
            gap: 5,
            alignSelf: "flex-start",
          }}
        >
          <CrownIcon />
          <Text style={{ color: isPremium ? "#4ade80" : "#fff", fontSize: 12, fontWeight: "600" }}>
            {isPremium ? "Premium" : "Get Premium"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBellPress} style={{ position: "relative" }}>
          <BellIcon />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                backgroundColor: "#ef4444",
                borderRadius: 6,
                minWidth: 12,
                height: 12,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: unreadCount > 9 ? 3 : 0,
              }}
            >
              {unreadCount <= 9 && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" }} />
              )}
              {unreadCount > 9 && (
                <Text style={{ color: "#fff", fontSize: 8, fontWeight: "700" }}>9+</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={onSettingsPress}>
          <GearIcon />
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
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 40, height: 40 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {initial}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
