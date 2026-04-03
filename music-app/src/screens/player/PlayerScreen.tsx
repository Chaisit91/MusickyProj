import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import Svg, { Path, Circle } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  togglePlay,
  nextSong,
  prevSong,
  seekTo,
  toggleShuffle,
  setRepeatMode,
  setVolume,
} from "../store/playerSlice";
import { toggleLikeSong, toggleDownload, loadLibrary } from "../store/librarySlice";
import AddToPlaylistSheet from "../Components/AddToPlaylistSheet";

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

const DownloadIcon = ({ downloaded }: { downloaded: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill={downloaded ? "#4fc3f7" : "#aaa"} d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
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

const VolumeLowIcon = ({ color = "#aaa" }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
    />
  </Svg>
);

const VolumeHighIcon = ({ color = "#aaa" }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
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
  const {
    currentSong,
    isPlaying,
    progressSeconds,
    durationSeconds,
    isShuffle,
    repeatMode,
    queue,
    currentIndex,
    volume,
  } = useAppSelector((s) => s.player);

  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);
  const isLiked = currentSong ? likedSongs.some((s) => s.id === currentSong?.id) : false;
  const isDownloaded = currentSong ? downloadedSongs.some((s) => s.id === currentSong?.id) : false;

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [activeTab, setActiveTab] = useState<"player" | "lyrics">("player");
  const [showPlaylistSheet, setShowPlaylistSheet] = useState(false);

  const duration = durationSeconds > 0 ? durationSeconds : (currentSong?.duration ?? 0);

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

  const upNext = queue[currentIndex + 1] ?? (repeatMode === "all" ? queue[0] : null);

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
        <TouchableOpacity onPress={() => setShowPlaylistSheet(true)} activeOpacity={0.7}>
          <MoreVertIcon />
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 32,
          marginBottom: 16,
          backgroundColor: "#1a1a1a",
          borderRadius: 10,
          padding: 3,
        }}
      >
        {(["player", "lyrics"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: activeTab === tab ? "#2a2a2a" : "transparent",
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? "#fff" : "#555",
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              {tab === "player" ? "PLAYER" : "LYRICS"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "player" ? (
        <>
          {/* ── Album art ── */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
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
              {currentSong.coverUrl ? (
                <Image
                  source={{ uri: currentSong.coverUrl }}
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
              <TouchableOpacity onPress={() => dispatch(toggleLikeSong(currentSong))} activeOpacity={0.7}>
                <HeartIcon filled={isLiked} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => dispatch(toggleDownload(currentSong))} activeOpacity={0.7}>
                <DownloadIcon downloaded={isDownloaded} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <ShareIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Progress Slider ── */}
          <View style={{ paddingHorizontal: 24, marginBottom: 4 }}>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={duration > 0 ? duration : 1}
              value={isSeeking ? seekValue : progressSeconds}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="#444444"
              thumbTintColor="#ffffff"
              onSlidingStart={(v) => { setIsSeeking(true); setSeekValue(v); }}
              onValueChange={(v) => setSeekValue(v)}
              onSlidingComplete={(v) => {
                setIsSeeking(false);
                dispatch(seekTo(Math.floor(v)));
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -6 }}>
              <Text style={{ color: "#666", fontSize: 11 }}>
                {fmt(isSeeking ? seekValue : progressSeconds)}
              </Text>
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
              marginBottom: 16,
            }}
          >
            <TouchableOpacity onPress={() => dispatch(toggleShuffle())} activeOpacity={0.7}>
              <ShuffleIcon active={isShuffle} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => dispatch(prevSong())} activeOpacity={0.7}>
              <SkipPrevIcon />
            </TouchableOpacity>

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

            <TouchableOpacity
              onPress={() => dispatch(setRepeatMode(repeatMode === "one" ? "none" : "one"))}
              activeOpacity={0.7}
            >
              <RepeatIcon mode={repeatMode} />
            </TouchableOpacity>
          </View>

          {/* ── Volume Slider ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 28,
              marginBottom: 16,
              gap: 8,
            }}
          >
            <TouchableOpacity onPress={() => dispatch(setVolume(0))} activeOpacity={0.7}>
              <VolumeLowIcon color={volume === 0 ? "#fff" : "#555"} />
            </TouchableOpacity>
            <Slider
              style={{ flex: 1, height: 32 }}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={volume}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="#333333"
              thumbTintColor="#ffffff"
              onValueChange={(v) => dispatch(setVolume(v))}
            />
            <TouchableOpacity onPress={() => dispatch(setVolume(1))} activeOpacity={0.7}>
              <VolumeHighIcon color={volume === 1 ? "#fff" : "#555"} />
            </TouchableOpacity>
          </View>

          {/* ── Connect to a device ── */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}
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
                <View style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", backgroundColor: "#333" }}>
                  {upNext.coverUrl ? (
                    <Image source={{ uri: upNext.coverUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
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
        </>
      ) : (
        /* ── Lyrics Tab ── */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Mini song info */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <View
              style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", backgroundColor: "#1a1a3e" }}
            >
              {currentSong.coverUrl ? (
                <Image
                  source={{ uri: currentSong.coverUrl }}
                  style={{ width: 48, height: 48 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#ffffff40" }}>♪</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
                {currentSong.title}
              </Text>
              <Text style={{ color: "#888", fontSize: 13 }} numberOfLines={1}>
                {currentSong.artist.name}
              </Text>
            </View>
          </View>

          {currentSong.lyrics ? (
            <Text
              style={{
                color: "#ddd",
                fontSize: 16,
                lineHeight: 30,
                letterSpacing: 0.3,
              }}
            >
              {currentSong.lyrics}
            </Text>
          ) : (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ color: "#333", fontSize: 40, marginBottom: 16 }}>♪</Text>
              <Text style={{ color: "#555", fontSize: 14 }}>ยังไม่มีเนื้อเพลง</Text>
            </View>
          )}
        </ScrollView>
      )}
      <AddToPlaylistSheet
        song={showPlaylistSheet ? currentSong : null}
        onClose={() => setShowPlaylistSheet(false)}
      />
    </View>
  );
}
