import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Linking,
  StatusBar,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { dismissAd, trackImpression, setShowingPreHomeAd } from "../../store/adsSlice";

const isVideoUrl = (url: string) =>
  url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);

export default function SplashAdModal() {
  const dispatch = useAppDispatch();
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);

  const [countdown, setCountdown] = useState(-1);
  const [canSkip, setCanSkip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = adVisible && adContext === "SPLASH" && !!currentAd;

  useEffect(() => {
    if (!visible || !currentAd) return;

    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 3;
    fadeAnim.setValue(0);
    setCanSkip(false);
    setCountdown(duration);

    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

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

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, currentAd?.id]);

  useEffect(() => {
    if (!visible) { setCountdown(-1); setCanSkip(false); }
  }, [visible]);

  const handleSkip = () => {
    if (!canSkip) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      dispatch(dismissAd());
      dispatch(setShowingPreHomeAd(false));
      router.replace("/home");
    });
  };

  const handleAdPress = () => {
    if (currentAd?.linkUrl) {
      Linking.openURL(currentAd.linkUrl).catch(() => {});
    }
  };

  if (!visible || !currentAd) return null;

  const isVideo = isVideoUrl(currentAd.imageUrl);

  return (
    <Modal
      visible
      transparent={false}
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* ── Full-screen media (กดเพื่อเปิด link) ── */}
        <TouchableOpacity
          activeOpacity={currentAd.linkUrl ? 0.92 : 1}
          onPress={handleAdPress}
          style={StyleSheet.absoluteFill}
        >
          {isVideo ? (
            <Video
              source={{ uri: currentAd.imageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping={false}
              isMuted={false}
            />
          ) : (
            <Image
              source={{ uri: currentAd.imageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}

          {/* gradient overlay ล่าง */}
          <View style={styles.gradientOverlay} />
        </TouchableOpacity>

        {/* ── Top bar: badge + skip ── */}
        <View style={styles.topBar}>
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>โฆษณา • {currentAd.advertiser}</Text>
          </View>

          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={canSkip ? 0.7 : 1}
            style={[styles.skipBtn, canSkip && styles.skipBtnActive]}
          >
            {canSkip ? (
              <Text style={styles.skipTextActive}>ข้าม  ✕</Text>
            ) : (
              <Text style={styles.skipTextCountdown}>ข้ามได้ใน {countdown > 0 ? countdown : "…"} วิ</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Bottom info ── */}
        <View style={styles.bottomInfo}>
          <Text style={styles.adTitle} numberOfLines={2}>{currentAd.title}</Text>
          <Text style={styles.adAdvertiser}>{currentAd.advertiser}</Text>

          {currentAd.linkUrl ? (
            <TouchableOpacity onPress={handleAdPress} style={styles.learnMoreBtn} activeOpacity={0.8}>
              <Text style={styles.learnMoreText}>ดูเพิ่มเติม ›</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.premiumHint}>สมัคร Premium เพื่อฟังเพลงโดยไม่มีโฆษณา</Text>
        </View>

      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    // gradient มืดจากล่างขึ้นบน — ใช้ View ซ้อน 2 ชั้นแทน LinearGradient
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  topBar: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  adBadge: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adBadgeText: {
    color: "#ccc",
    fontSize: 12,
  },
  skipBtn: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  skipBtnActive: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: "transparent",
  },
  skipTextCountdown: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  skipTextActive: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 6,
  },
  adTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  adAdvertiser: {
    color: "#ccc",
    fontSize: 14,
  },
  learnMoreBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  learnMoreText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  premiumHint: {
    color: "#666",
    fontSize: 11,
    marginTop: 8,
  },
});
