import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  GestureResponderEvent,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  togglePlay,
  nextSong,
  prevSong,
  setProgress,
  toggleShuffle,
  cycleRepeat,
} from "../store/playerSlice";

const { width } = Dimensions.get("window");
const ART_SIZE = width - 64;

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDown = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path fill="#fff" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </Svg>
);

const MoreVertIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={5} r={2} fill="#aaa" />
    <Circle cx={12} cy={12} r={2} fill="#aaa" />
    <Circle cx={12} cy={19} r={2} fill="#aaa" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path fill="#000" d="M8 5v14l11-7z" />
  </Svg>
);

const PauseIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path fill="#000" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

const SkipNextIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 24 24">
    <Path fill="#fff" d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
  </Svg>
);

const SkipPrevIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 24 24">
    <Path fill="#fff" d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </Svg>
);

const ShuffleIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={active ? "#fff" : "#555"}
      d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
    />
  </Svg>
);

const RepeatIcon = ({ mode }: { mode: "none" | "all" | "one" }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={mode === "none" ? "#555" : "#fff"}
      d={
        mode === "one"
          ? "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"
          : "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
      }
    />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={filled ? "#e74c3c" : "none"}
      stroke={filled ? "#e74c3c" : "#aaa"}
      strokeWidth={1.8}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </Svg>
);

const DownloadIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill="#aaa"
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"
    />
  </Svg>
);

const DeviceIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      fill="#aaa"
      d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-5 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
    />
  </Svg>
);

// ─── Format time ──────────────────────────────────────────────────────────────

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─── PlayerScreen ─────────────────────────────────────────────────────────────

export default function PlayerScreen() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, progressSeconds, isShuffle, repeatMode, queue, currentIndex } =
    useAppSelector((s) => s.player);

  const [liked, setLiked] = useState(false);
  const trackRef = useRef<View>(null);
  const [trackWidth, setTrackWidth] = useState(width - 64);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = currentSong?.duration ?? 200;

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        dispatch(setProgress(progressSeconds + 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, progressSeconds]);

  // ── Auto next on end ────────────────────────────────────────────────────
  useEffect(() => {
    if (progressSeconds >= duration) {
      dispatch(nextSong());
    }
  }, [progressSeconds, duration]);

  if (!currentSong) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: "#555", fontSize: 16 }}>No song playing</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = Math.min(progressSeconds / duration, 1);

  const handleSeek = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const pct = Math.max(0, Math.min(1, x / trackWidth));
    dispatch(setProgress(Math.floor(pct * duration)));
  };

  const upNext = queue[currentIndex + 1] ?? queue[0];

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* ── Top bar ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 52,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronDown />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#888", fontSize: 11, letterSpacing: 1 }}>NOW PLAYING</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MoreVertIcon />
        </TouchableOpacity>
      </View>

      {/* ── Album art ── */}
      <View style={{ alignItems: "center", marginVertical: 24 }}>
        <View
          style={{
            width: ART_SIZE,
            height: ART_SIZE,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#1a1a3e",
            elevation: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}
        >
          {currentSong.album.coverUrl ? (
            <Image
              source={{ uri: currentSong.album.coverUrl }}
              style={{ width: ART_SIZE, height: ART_SIZE }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#ffffff20", fontSize: 80 }}>♪</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Song info + actions ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 32,
          marginBottom: 20,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={{ color: "#888", fontSize: 14, marginTop: 4 }} numberOfLines={1}>
            {currentSong.artist.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <TouchableOpacity onPress={() => setLiked((v) => !v)} activeOpacity={0.7}>
            <HeartIcon filled={liked} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <DownloadIcon />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <ShareIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={{ paddingHorizontal: 32, marginBottom: 6 }}>
        <View
          ref={trackRef}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleSeek}
          style={{
            height: 36,
            justifyContent: "center",
          }}
        >
          {/* Track */}
          <View style={{ height: 3, backgroundColor: "#333", borderRadius: 2 }}>
            <View
              style={{
                height: 3,
                width: `${progress * 100}%`,
                backgroundColor: "#fff",
                borderRadius: 2,
              }}
            />
          </View>
          {/* Thumb */}
          <View
            style={{
              position: "absolute",
              left: `${progress * 100}%`,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#fff",
              marginLeft: -7,
              top: "50%",
              marginTop: -7,
            }}
          />
        </View>

        {/* Time labels */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#666", fontSize: 11 }}>{fmt(progressSeconds)}</Text>
          <Text style={{ color: "#666", fontSize: 11 }}>{fmt(duration)}</Text>
        </View>
      </View>

      {/* ── Controls ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 32,
          marginTop: 10,
          marginBottom: 28,
        }}
      >
        <TouchableOpacity onPress={() => dispatch(toggleShuffle())} activeOpacity={0.7}>
          <ShuffleIcon active={isShuffle} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => dispatch(prevSong())} activeOpacity={0.7}>
          <SkipPrevIcon />
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity
          onPress={() => dispatch(togglePlay())}
          activeOpacity={0.85}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => dispatch(nextSong())} activeOpacity={0.7}>
          <SkipNextIcon />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => dispatch(cycleRepeat())} activeOpacity={0.7}>
          <RepeatIcon mode={repeatMode} />
        </TouchableOpacity>
      </View>

      {/* ── Connect to a device ── */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}
      >
        <DeviceIcon />
        <Text style={{ color: "#aaa", fontSize: 12 }}>Connect to a device</Text>
      </TouchableOpacity>

      {/* ── Up Next ── */}
      <View
        style={{
          marginHorizontal: 20,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#1a1a1a",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ color: "#888", fontSize: 12, fontWeight: "600" }}>Up Next</Text>

        {upNext ? (
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", backgroundColor: "#333" }}
            >
              {upNext.album.coverUrl ? (
                <Image source={{ uri: upNext.album.coverUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
              ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#555" }}>♪</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
                {upNext.title}
              </Text>
              <Text style={{ color: "#666", fontSize: 11 }} numberOfLines={1}>
                {upNext.artist.name}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: "#555", fontSize: 12, flex: 1 }}>End of queue</Text>
        )}

        <TouchableOpacity onPress={() => router.push("/queue")} activeOpacity={0.7}>
          <Text style={{ color: "#aaa", fontSize: 12, fontWeight: "600" }}>Queue ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
