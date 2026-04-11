import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutThunk, fetchMeThunk } from "../../store/authSlice";
import { loadLibrary } from "../../store/librarySlice";
import { savePreferences, setPreferenceLocal } from "../../store/preferencesSlice";
import MiniPlayer from "../../Components/player/MiniPlayer";
import BottomNav, { TabName } from "../../Components/layout/Bottomnav";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const EditIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#fff"
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
    />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#555" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
  </Svg>
);

const CrownIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#FFD700" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2 3h10v2H7v-2z" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#ff4444"
      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
    />
  </Svg>
);

// ─── Setting Row ──────────────────────────────────────────────────────────────

const SettingRow = ({
  label,
  value,
  onPress,
  rightElement,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#1e1e1e",
    }}
  >
    <Text style={{ color: "#fff", fontSize: 15 }}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {value ? (
        <Text style={{ color: "#888", fontSize: 14 }}>{value}</Text>
      ) : null}
      {rightElement ?? (onPress ? <ChevronRight /> : null)}
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const playlists = useAppSelector((s) => s.library.playlists);
  const followedArtists = useAppSelector((s) => s.library.followedArtists);
  const prefs = useAppSelector((s) => s.preferences);

  const [activeTab, setActiveTab] = useState<TabName>("Home");

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMeThunk());
    }, [])
  );

  const saveAutoPlay = (val: boolean) => {
    dispatch(setPreferenceLocal({ autoPlay: val }));
    dispatch(savePreferences({ autoPlay: val }));
  };

  const saveShowLyrics = (val: boolean) => {
    dispatch(setPreferenceLocal({ showLyrics: val }));
    dispatch(savePreferences({ showLyrics: val }));
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await dispatch(logoutThunk());
        },
      },
    ]);
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Search") router.replace("/search");
    if (tab === "Your Library") router.replace("/your-library");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const langLabel = prefs.musicLanguages.join(", ");

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>My Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/settings/edit-profile")}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#1e1e1e",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
            }}
          >
            <EditIcon />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Avatar + Name ── */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#5b4fcf",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              borderWidth: 3,
              borderColor: "#2a2a2a",
              overflow: "hidden",
            }}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 90, height: 90 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: "#fff", fontSize: 36, fontWeight: "700" }}>{initial}</Text>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{user?.name ?? ""}</Text>
            <CrownIcon />
          </View>
        </View>

        {/* ── User Info ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: "#888", fontSize: 12, fontWeight: "600", marginBottom: 2 }}>Email</Text>
            <Text style={{ color: "#ccc", fontSize: 14 }}>{user?.email ?? ""}</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            gap: 10,
            marginBottom: 28,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#1e1e1e",
              borderRadius: 14,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
              {likedSongs.length}
            </Text>
            <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>songs</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#1e1e1e",
              borderRadius: 14,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
              {playlists.length}
            </Text>
            <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>playlists</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#1e1e1e",
              borderRadius: 14,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
              {followedArtists.length}
            </Text>
            <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>artists</Text>
          </View>
        </View>

        {/* ── Settings Section ── */}
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            paddingHorizontal: 20,
            marginBottom: 8,
          }}
        >
          Settings
        </Text>
        <View style={{ backgroundColor: "#161616", borderRadius: 14, marginHorizontal: 16, overflow: "hidden" }}>
          <SettingRow
            label="Music Language(s)"
            value={langLabel}
            onPress={() => router.push("/settings/music-language")}
          />
          <SettingRow
            label="Streaming Quality"
            value={prefs.streamingQuality}
            onPress={() => router.push("/settings/streaming-quality")}
          />
          <SettingRow
            label="Download Quality"
            value={prefs.downloadQuality}
            onPress={() => router.push("/settings/download-quality")}
          />
          <SettingRow
            label="Auto-Play"
            rightElement={
              <Switch
                value={prefs.autoPlay}
                onValueChange={saveAutoPlay}
                trackColor={{ false: "#333", true: "#7c3aed" }}
                thumbColor="#fff"
              />
            }
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15 }}>Show Lyrics on Player</Text>
            <Switch
              value={prefs.showLyrics}
              onValueChange={saveShowLyrics}
              trackColor={{ false: "#333", true: "#7c3aed" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Others Section ── */}
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            paddingHorizontal: 20,
            marginTop: 28,
            marginBottom: 8,
          }}
        >
          Others
        </Text>
        <View style={{ backgroundColor: "#161616", borderRadius: 14, marginHorizontal: 16, overflow: "hidden" }}>
          <SettingRow
            label="Help & Support"
            onPress={() => router.push("/settings/help-support")}
          />
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 15,
              paddingHorizontal: 20,
            }}
          >
            <LogoutIcon />
            <Text style={{ color: "#ff4444", fontSize: 15, fontWeight: "600" }}>Logout</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
