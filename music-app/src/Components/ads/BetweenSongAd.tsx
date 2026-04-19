// Modal โฆษณาระหว่างเพลง (AFTER_SONG) — แสดงเหนือ player UI, countdown + progress bar, รองรับ image/video ad, เมื่อจบ auto-next song + bumpReload | ปิดด้วยปุ่ม chevron down
//
// หลักการทำงาน:
// 1. ตรวจสอบ Redux state: adVisible=true + adContext="AFTER_SONG" + currentAd มีข้อมูล → แสดง Modal
// 2. เมื่อ visible: บันทึก impression, เริ่ม countdown timer (setInterval ลดทีละ 1 วิ), เริ่ม progress bar animation (Animated.timing)
// 3. ถ้า ad เป็นวิดีโอ (URL มี /video/upload/ หรือนามสกุล .mp4/.webm/.mov) → render AdVideo (useVideoPlayer)
// 4. เมื่อ timeLeft === 0: รอ 500ms แล้ว dispatch dismissAd + nextSong + bumpReload (โหลด player ใหม่)
// 5. ผู้ใช้กด chevron down: ปิด ad ทันทีโดย dismiss + router.back() (ไม่ข้ามเพลง)
// 6. กด ad image: Linking.openURL(linkUrl) เปิด URL โฆษณาใน browser ภายนอก

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import Svg, { Path, Circle } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { dismissAd, setPendingNextSong, trackImpression } from "../../store/adsSlice";
import { nextSong, bumpReload } from "../../store/playerSlice";

const { width } = Dimensions.get("window");
const ART_SIZE = width - 64;

const isVideoUrl = (url: string) =>
  url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ── Icons (เหมือน player.tsx) ──────────────────────────────────────────────────
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
const ShuffleIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#555" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
  </Svg>
);
const RepeatIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#555" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
  </Svg>
);
const HeartIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="none" stroke="#aaa" strokeWidth={1.8}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);
const DownloadIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </Svg>
);
const ShareIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
  </Svg>
);
const DeviceIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-5 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </Svg>
);
const VolumeLowIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#555" d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
  </Svg>
);
const VolumeHighIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#555" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </Svg>
);

// ── Video sub-component ────────────────────────────────────────────────────────
function AdVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={{ width: ART_SIZE, height: ART_SIZE }}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BetweenSongAd() {
  const dispatch = useAppDispatch();
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);
  const { currentSong, queue, currentIndex, volume } = useAppSelector((s) => s.player);

  const [timeLeft, setTimeLeft] = useState(-1);
  const [adDuration, setAdDuration] = useState(15);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = adVisible && adContext === "AFTER_SONG" && !!currentAd;
  const upNext = queue[currentIndex + 1] ?? queue[0] ?? null;

  useEffect(() => {
    if (!visible || !currentAd) return;
    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 15;
    setAdDuration(duration);
    fadeAnim.setValue(0);
    progressAnim.setValue(0);

    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();

    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      progressAnim.stopAnimation();
    };
  }, [visible, currentAd?.id]);

  useEffect(() => {
    if (!visible || timeLeft < 0 || timeLeft !== 0) return;
    const timer = setTimeout(() => {
      dispatch(dismissAd());
      dispatch(setPendingNextSong(false));
      dispatch(nextSong());
      dispatch(bumpReload());
    }, 500);
    return () => clearTimeout(timer);
  }, [timeLeft, visible]);

  useEffect(() => { if (!visible) setTimeLeft(-1); }, [visible]);

  if (!visible || !currentAd) return null;

  const isVideo = isVideoUrl(currentAd.imageUrl);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const handleAdPress = () => {
    if (currentAd.linkUrl) Linking.openURL(currentAd.linkUrl).catch(() => {});
  };

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: "#111111", opacity: fadeAnim }}>
        <StatusBar barStyle="light-content" backgroundColor="#111111" />

        {/* ── Drag handle ── */}
        <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 2 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#333" }} />
        </View>

        {/* ── Top bar ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 12,
        }}>
          <TouchableOpacity onPress={() => {
            dispatch(dismissAd());
            dispatch(setPendingNextSong(false));
            router.back();
          }} activeOpacity={0.7}>
            <ChevronDown />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#888", fontSize: 11, letterSpacing: 1 }}>NOW PLAYING</Text>
          </View>
          <MoreVertIcon />
        </View>

        {/* ── Tabs (disabled) ── */}
        <View style={{
          flexDirection: "row",
          marginHorizontal: 32,
          marginBottom: 16,
          backgroundColor: "#1a1a1a",
          borderRadius: 10,
          padding: 3,
        }}>
          {(["PLAYER", "LYRICS"] as const).map((tab) => (
            <View key={tab} style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: tab === "PLAYER" ? "#2a2a2a" : "transparent",
            }}>
              <Text style={{
                color: tab === "PLAYER" ? "#fff" : "#555",
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.5,
              }}>
                {tab}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Ad image แทน album art ── */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <TouchableOpacity
            activeOpacity={currentAd.linkUrl ? 0.9 : 1}
            onPress={handleAdPress}
            style={{
              width: ART_SIZE,
              height: ART_SIZE,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#1a1a1a",
              elevation: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
            }}
          >
            {isVideo ? (
              <AdVideo uri={currentAd.imageUrl} />
            ) : (
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={{ width: ART_SIZE, height: ART_SIZE }}
                contentFit="cover"
              />
            )}

            {/* countdown badge */}
            <View style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.65)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                {timeLeft > 0 ? `${timeLeft} วิ` : "…"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Song info + action icons (เหมือน player) ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 32,
          marginBottom: 20,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }} numberOfLines={1}>
              {currentSong?.title ?? ""}
            </Text>
            <Text style={{ color: "#888", fontSize: 14, marginTop: 4 }} numberOfLines={1}>
              {(currentSong?.artist as any)?.name ?? ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center", opacity: 0.3 }}>
            <HeartIcon />
            <DownloadIcon />
            <ShareIcon />
          </View>
        </View>

        {/* ── Progress bar (ad countdown, ไม่ให้ drag) ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 4 }}>
          <View style={{ height: 3, backgroundColor: "#444", borderRadius: 2, overflow: "hidden", marginVertical: 18 }}>
            <Animated.View style={{ height: 3, backgroundColor: "#ffffff", width: progressWidth, borderRadius: 2 }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -6 }}>
            <Text style={{ color: "#666", fontSize: 11 }}>
              {timeLeft > 0 ? fmt(adDuration - timeLeft) : fmt(adDuration)}
            </Text>
            <Text style={{ color: "#666", fontSize: 11 }}>{fmt(adDuration)}</Text>
          </View>
        </View>

        {/* ── Controls (disabled ระหว่างโฆษณา) ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 32,
          marginTop: 10,
          marginBottom: 16,
          opacity: 0.25,
          pointerEvents: "none",
        } as any}>
          <ShuffleIcon />
          <SkipPrevIcon />
          <View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: "#fff",
            alignItems: "center", justifyContent: "center",
          }}>
            <PlayIcon />
          </View>
          <SkipNextIcon />
          <RepeatIcon />
        </View>

        {/* ── Volume bar (disabled) ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 28,
          marginBottom: 16,
          gap: 8,
          opacity: 0.25,
        }}>
          <VolumeLowIcon />
          <View style={{ flex: 1, height: 3, backgroundColor: "#555", borderRadius: 2 }}>
            <View style={{
              width: `${volume * 100}%`,
              height: 3,
              backgroundColor: "#fff",
              borderRadius: 2,
            }} />
          </View>
          <VolumeHighIcon />
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
        <View style={{
          marginHorizontal: 20,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#1a1a1a",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}>
          <Text style={{ color: "#888", fontSize: 12, fontWeight: "600" }}>Up Next</Text>
          {upNext ? (
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", backgroundColor: "#333" }}>
                {upNext.coverUrl ? (
                  <Image source={{ uri: upNext.coverUrl }} style={{ width: 36, height: 36 }} contentFit="cover" />
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
                  {(upNext.artist as any)?.name ?? ""}
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

      </Animated.View>
    </Modal>
  );
}
