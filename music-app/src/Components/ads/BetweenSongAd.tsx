import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { dismissAd, setPendingNextSong, trackImpression } from "../../store/adsSlice";
import { nextSong } from "../../store/playerSlice";

const { width, height } = Dimensions.get("window");

const isVideoUrl = (url: string) =>
  url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);

export default function BetweenSongAd() {
  const dispatch = useAppDispatch();
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);

  // -1 = ยังไม่เริ่ม countdown, ≥0 = นับถอยหลัง
  const [timeLeft, setTimeLeft] = useState(-1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible =
    adVisible &&
    (adContext === "AFTER_SONG" || adContext === "AFTER_MULTIPLE") &&
    !!currentAd;

  console.log("[BetweenSongAd] visible:", visible, "adContext:", adContext, "adId:", currentAd?.id ?? "null");

  useEffect(() => {
    if (!visible || !currentAd) return;

    console.log("[BetweenSongAd] starting — ad:", currentAd.id, "duration:", currentAd.adDuration);
    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 15;

    // รีเซ็ต animation
    fadeAnim.setValue(0);
    progressAnim.setValue(0);

    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();

    // เริ่ม countdown (ต้อง set ก่อน interval เพื่อให้ dismiss effect ทำงานถูก)
    setTimeLeft(duration);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      progressAnim.stopAnimation();
    };
  }, [visible, currentAd?.id]);

  // dismiss เมื่อ countdown จบ (timeLeft ต้อง ≥ 0 ก่อน ถึงจะ dismiss เมื่อเป็น 0)
  useEffect(() => {
    if (!visible || timeLeft < 0 || timeLeft !== 0) return;
    console.log("[BetweenSongAd] countdown done → dismiss + nextSong");
    const timer = setTimeout(() => {
      dispatch(dismissAd());
      dispatch(setPendingNextSong(false));
      dispatch(nextSong());
    }, 500);
    return () => clearTimeout(timer);
  }, [timeLeft, visible]);

  // reset timeLeft เมื่อ modal ปิด
  useEffect(() => {
    if (!visible) {
      setTimeLeft(-1);
    }
  }, [visible]);

  if (!visible || !currentAd) return null;

  const isVideo = isVideoUrl(currentAd.imageUrl);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: "#000", opacity: fadeAnim }}>

        {/* Progress bar */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.15)", zIndex: 10 }}>
          <Animated.View style={{ height: 3, backgroundColor: "#7c3aed", width: progressWidth }} />
        </View>

        {/* Top bar */}
        <View
          style={{
            position: "absolute",
            top: 52,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            zIndex: 10,
          }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: "#aaa", fontSize: 11 }}>โฆษณา • {currentAd.advertiser}</Text>
          </View>
          <View style={{ backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}>
            <Text style={{ color: "#888", fontSize: 13 }}>
              {timeLeft > 0 ? `อีก ${timeLeft} วิ` : "กำลังโหลด..."}
            </Text>
          </View>
        </View>

        {/* Media */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {isVideo ? (
            <Video
              source={{ uri: currentAd.imageUrl }}
              style={{ width, height: height * 0.65 }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: currentAd.imageUrl }}
              style={{ width, height: height * 0.65 }}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Ad title + advertiser */}
        <View style={{ position: "absolute", bottom: 120, left: 0, right: 0, paddingHorizontal: 24, gap: 4 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }} numberOfLines={2}>
            {currentAd.title}
          </Text>
          <Text style={{ color: "#aaa", fontSize: 14 }}>{currentAd.advertiser}</Text>
        </View>

        {/* Bottom */}
        <View style={{ position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center", gap: 10 }}>
          <Text style={{ color: "#666", fontSize: 12 }}>ต้องดูโฆษณาจนจบก่อนเพลงถัดไปจะเล่น</Text>
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            activeOpacity={0.8}
            style={{ backgroundColor: "#7c3aed", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✦ สมัคร Premium — ไม่มีโฆษณา</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </Modal>
  );
}
