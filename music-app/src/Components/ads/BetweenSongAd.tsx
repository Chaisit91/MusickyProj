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

  const [timeLeft, setTimeLeft] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = adVisible && adContext === "AFTER_SONG" && !!currentAd;

  useEffect(() => {
    if (!visible || !currentAd) return;

    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 15;
    setTimeLeft(duration);

    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

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
    };
  }, [visible, currentAd?.id]);

  // เมื่อ countdown ถึง 0 → ปิด ad แล้วเล่นเพลงถัดไป
  useEffect(() => {
    if (!visible || timeLeft !== 0) return;
    const timer = setTimeout(() => {
      dispatch(dismissAd());
      dispatch(setPendingNextSong(false));
      dispatch(nextSong());
    }, 500);
    return () => clearTimeout(timer);
  }, [timeLeft, visible]);

  if (!visible || !currentAd) return null;

  const isVideo = isVideoUrl(currentAd.imageUrl);
  const duration = currentAd.adDuration ?? 15;
  const progress = (duration - timeLeft) / duration;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: "#000", opacity: fadeAnim }}>

        {/* Media */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {isVideo ? (
            <Video
              source={{ uri: currentAd.imageUrl }}
              style={{ width, height: height * 0.7 }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: currentAd.imageUrl }}
              style={{ width, height: height * 0.7 }}
              resizeMode="contain"
            />
          )}
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
          }}
        >
          <View style={{ backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: "#aaa", fontSize: 11 }}>โฆษณา • {currentAd.advertiser}</Text>
          </View>

          {/* ข้ามไม่ได้ */}
          <View style={{ backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}>
            <Text style={{ color: "#888", fontSize: 13 }}>อีก {timeLeft} วิ</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ position: "absolute", top: 44, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.15)" }}>
          <Animated.View
            style={{
              height: 3,
              backgroundColor: "#7c3aed",
              width: `${progress * 100}%`,
            }}
          />
        </View>

        {/* Bottom */}
        <View style={{ position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center", gap: 10 }}>
          <Text style={{ color: "#888", fontSize: 12 }}>
            ต้องดูโฆษณาจนจบก่อนเพลงถัดไปจะเล่น
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#7c3aed",
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              ✦ สมัคร Premium — ไม่มีโฆษณา
            </Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </Modal>
  );
}
