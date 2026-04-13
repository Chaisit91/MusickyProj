import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Image } from "expo-image";
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

// ── Video sub-component (useVideoPlayer must be at top-level of a component) ──
function AdVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

export default function HomeAdsScreen() {
  const dispatch = useAppDispatch();
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);

  const [countdown, setCountdown] = useState(-1);
  const [canSkip, setCanSkip] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const impressionTracked = useRef(false);

  // ── fetch ad on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(showSplashAd()).then((result: any) => {
      setLoading(false);
      if (!result.payload) {
        // ไม่มี ad → ไปหน้า home เลย
        dispatch(setShowingPreHomeAd(false));
        router.replace("/home");
      }
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── start countdown when ad is ready ──────────────────────────────────────
  useEffect(() => {
    if (!currentAd || adContext !== "SPLASH" || !adVisible) return;
    if (impressionTracked.current) return;

    impressionTracked.current = true;
    dispatch(trackImpression(currentAd.id));

    const duration = currentAd.adDuration ?? 5;
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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

  // ── Loading ────────────────────────────────────────────────────────────────
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
          <AdVideo uri={currentAd.imageUrl} />
        ) : (
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
      </TouchableOpacity>

      {/* ── Dark overlay gradient (top) ── */}
      <View style={styles.topOverlay} pointerEvents="none" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        {/* "HOME Ads" label */}
        <Text style={styles.homeAdsLabel}>HOME Ads</Text>

        {/* Skip button */}
        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={canSkip ? 0.8 : 1}
          disabled={!canSkip}
          style={[styles.skipBtn, canSkip && styles.skipBtnReady]}
        >
          <Text style={[styles.skipText, canSkip && styles.skipTextReady]}>
            {canSkip ? "SKIP Ads" : `SKIP Ads ${countdown > 0 ? countdown : "…"} sec`}
          </Text>
          <View style={[styles.skipArrow, canSkip && styles.skipArrowReady]}>
            <Text style={[styles.skipArrowText, canSkip && styles.skipArrowTextReady]}>›</Text>
          </View>
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
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    // soft dark gradient from top
    backgroundColor: "transparent",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
  } as any,
  topBar: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  homeAdsLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 5,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  skipBtnReady: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "transparent",
  },
  skipText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  skipTextReady: {
    color: "#000",
  },
  skipArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  skipArrowReady: {
    backgroundColor: "#000",
  },
  skipArrowText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    marginTop: -1,
  },
  skipArrowTextReady: {
    color: "#fff",
  },
});
