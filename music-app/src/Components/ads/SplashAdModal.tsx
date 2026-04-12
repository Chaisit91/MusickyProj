import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { dismissAd, trackImpression } from "../../store/adsSlice";

const { width, height } = Dimensions.get("window");

const isVideoUrl = (url: string) =>
  url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);

export default function SplashAdModal() {
  const dispatch = useAppDispatch();
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);

  const [countdown, setCountdown] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = adVisible && adContext === "SPLASH" && !!currentAd;

  useEffect(() => {
    if (!visible || !currentAd) return;

    // บันทึก impression
    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 5;
    setCountdown(duration);
    setCanSkip(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, currentAd?.id]);

  const handleSkip = () => {
    if (!canSkip) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => dispatch(dismissAd()));
  };

  if (!visible || !currentAd) return null;

  const isVideo = isVideoUrl(currentAd.imageUrl);

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={{ flex: 1, backgroundColor: "#000", opacity: fadeAnim }}>

        {/* Media */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {isVideo ? (
            <Video
              source={{ uri: currentAd.imageUrl }}
              style={{ width, height: height * 0.75 }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping={false}
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: currentAd.imageUrl }}
              style={{ width, height: height * 0.75 }}
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
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#aaa", fontSize: 11 }}>โฆษณา • {currentAd.advertiser}</Text>
          </View>

          {/* Skip button */}
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={canSkip ? 0.7 : 1}
            style={{
              backgroundColor: canSkip ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {canSkip ? (
              <Text style={{ color: "#000", fontSize: 13, fontWeight: "700" }}>ข้าม ✕</Text>
            ) : (
              <Text style={{ color: "#fff", fontSize: 13 }}>ข้ามได้ใน {countdown} วิ</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text style={{ color: "#888", fontSize: 12 }}>
            {canSkip ? "กดปุ่มด้านบนเพื่อข้ามโฆษณา" : `โฆษณา ${currentAd.adDuration - countdown}/${currentAd.adDuration} วินาที`}
          </Text>
          <Text style={{ color: "#555", fontSize: 11 }}>
            สมัคร Premium เพื่อฟังเพลงโดยไม่มีโฆษณา
          </Text>
        </View>

      </Animated.View>
    </Modal>
  );
}
