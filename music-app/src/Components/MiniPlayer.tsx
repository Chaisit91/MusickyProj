import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { togglePlay, stopSong } from "../store/playerSlice";

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#fff" d="M8 5v14l11-7z" />
  </Svg>
);

const PauseIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path fill="#666" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Svg>
);

// ─── MiniPlayer ───────────────────────────────────────────────────────────────

export default function MiniPlayer() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, progressSeconds } = useAppSelector((s) => s.player);

  if (!currentSong) return null;

  const duration = currentSong.duration ?? 200;
  const progress = Math.min(progressSeconds / duration, 1);
  const coverUri = currentSong.coverUrl || currentSong.album.coverUrl;

  return (
    <TouchableOpacity
      onPress={() => router.push("/player")}
      activeOpacity={0.95}
      style={{
        position: "absolute",
        bottom: 96,
        left: 10,
        right: 10,
        height: 68,
        borderRadius: 14,
        backgroundColor: "#1c1c1e",
        flexDirection:"row",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10,
        gap: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2e2e2e",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      {/* Progress bar at bottom */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#2e2e2e" }}>
        <View style={{ height: 2, width: `${progress * 100}%`, backgroundColor: "#ffffff80" }} />
      </View>

      {/* Album art */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#2a2a2a",
        }}
      >
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={{ width: 48, height: 48 }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#555", fontSize: 20 }}>♪</Text>
          </View>
        )}
      </View>

      {/* Song info */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.1 }} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {currentSong.artist.name}
        </Text>
      </View>

      {/* Play / Pause — circle button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          dispatch(togglePlay());
        }}
        activeOpacity={0.8}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#2e2e3e",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#ffffff18",
        }}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </TouchableOpacity>

      {/* Close */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          dispatch(stopSong());
        }}
        activeOpacity={0.7}
        style={{ padding: 6 }}
      >
        <CloseIcon />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
