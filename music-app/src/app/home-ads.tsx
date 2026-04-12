import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  showSplashAd,
  dismissAd,
  trackImpression,
  setShowingPreHomeAd,
} from "../store/adsSlice";

const isVideoUrl = (url: string) =>
  url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);

// ── sub-component สำหรับวิดีโอ (useVideoPlayer ต้องอยู่ top-level ของ component) ──
function AdVideo({ uri, style }: { uri: string; style: any }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });
  return <VideoView player={player} style={style} contentFit="cover" />;
}

export default function HomeAdsScreen() {
  const dispatch = useAppDispatch();
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);

  const [countdown, setCountdown] = useState(-1);
  const [canSkip, setCanSkip] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const impressionTracked = useRef(false);

  // ── โหลด ad ตอน mount ──────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(showSplashAd()).then((result: any) => {
      setLoading(false);
      if (!result.payload) {
        dispatch(setShowingPreHomeAd(false));
        router.replace("/home");
      }
    });
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ── เริ่ม countdown เมื่อ ad พร้อม ────────────────────────────────────────
  useEffect(() => {
    if (!currentAd || adContext !== "SPLASH" || !adVisible) return;
    if (impressionTracked.current) return;

    impressionTracked.current = true;
    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 3;
    setCountdown(duration);
    setCanSkip(false);

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
  }, [currentAd?.id, adVisible]);

  const handleSkip = () => {
    if (!canSkip) return;
    dispatch(dismissAd());
    dispatch(setShowingPreHomeAd(false));
    impressionTracked.current = false;
    router.replace("/home");
  };

  const handleAdPress = () => {
    if (currentAd?.linkUrl) {
      Linking.openURL(currentAd.linkUrl).catch(() => {});
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (!currentAd || adContext !== "SPLASH") return null;

  const isVideo = isVideoUrl(currentAd.imageUrl);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Full-screen media ── */}
      <TouchableOpacity
        activeOpacity={currentAd.linkUrl ? 0.9 : 1}
        onPress={handleAdPress}
        style={StyleSheet.absoluteFill}
      >
        {isVideo ? (
          <AdVideo uri={currentAd.imageUrl} style={StyleSheet.absoluteFill} />
        ) : (
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Text style={styles.homeAdsLabel}>HOME Ads</Text>

        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={canSkip ? 0.75 : 1}
          disabled={!canSkip}
          style={[styles.skipBtn, !canSkip && styles.skipBtnWaiting]}
        >
          <Text style={[styles.skipText, !canSkip && styles.skipTextWaiting]}>
            {canSkip
              ? "SKIP Ads ►"
              : `SKIP Ads ${countdown > 0 ? countdown : "…"} sec ►`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
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
  homeAdsLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  skipBtn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  skipBtnWaiting: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  skipText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  skipTextWaiting: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },
});
