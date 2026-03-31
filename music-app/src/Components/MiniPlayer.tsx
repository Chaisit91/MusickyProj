import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { togglePlay } from "../store/playerSlice";

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M8 5v14l11-7z" />
  </Svg>
);

const PauseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

// ─── MiniPlayer ───────────────────────────────────────────────────────────────

export default function MiniPlayer() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, progressSeconds } = useAppSelector((s) => s.player);

  if (!currentSong) return null;

  const duration = currentSong.duration ?? 200;
  const progress = Math.min(progressSeconds / duration, 1);

  return (
    <TouchableOpacity
      onPress={() => router.push("/player")}
      activeOpacity={0.9}
      style={{
        position: "absolute",
        bottom: 68, // above BottomNav
        left: 8,
        right: 8,
        height: 64,
        borderRadius: 12,
        backgroundColor: "#1e1e1e",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        gap: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2a2a2a",
      }}
    >
      {/* Progress bar at bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: "#2a2a2a",
        }}
      >
        <View
          style={{
            height: 2,
            width: `${progress * 100}%`,
            backgroundColor: "#fff",
          }}
        />
      </View>

      {/* Album art */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#333",
        }}
      >
        {(currentSong.coverUrl || currentSong.album.coverUrl) ? (
          <Image
            source={{ uri: (currentSong.coverUrl || currentSong.album.coverUrl)! }}
            style={{ width: 44, height: 44 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#555", fontSize: 18 }}>♪</Text>
          </View>
        )}
      </View>

      {/* Song info */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }} numberOfLines={1}>
          {currentSong.artist.name}
        </Text>
      </View>

      {/* Play / Pause */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          dispatch(togglePlay());
        }}
        activeOpacity={0.7}
        style={{ padding: 8 }}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
