// หน้า Splash Ad หลัง login สำหรับ free user — โหลด SPLASH ad จาก server, countdown ก่อน skip ได้, video ad auto-navigate เมื่อจบ, ไม่มี ad → redirect /home ทันที
//
// หลักการทำงาน:
// 1. useEffect mount: dispatch showSplashAd → โหลด ad จาก server
// 2. showSplashAd fulfilled: ถ้าไม่มี ad → setShowingPreHomeAd(false) → AuthGuard redirect /home ทันที
// 3. ถ้ามี ad: แสดง countdown timer (setTimeout ลดทุก 1 วิ) → ปุ่ม Skip ปรากฏเมื่อ timeLeft===0
// 4. AdVideo component: useVideoPlayer play ทันที, subscribe "playToEnd" event → เรียก onEnd(handleSkip)
// 5. handleSkip: dispatch dismissAd + setShowingPreHomeAd(false) → router.replace("/home")
// 6. กด ad image: Linking.openURL(linkUrl) เปิด URL ใน browser

// นำเข้า React และ hooks สำหรับ state, ref, effect
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator, // spinner loading
  Linking,           // เปิด URL ภายนอก (เมื่อผู้ใช้กด ad)
} from "react-native";
// Image จาก expo-image รองรับ cache และ placeholder ได้ดีกว่า RN Image
import { Image } from "expo-image";
// VideoView + useVideoPlayer สำหรับแสดงโฆษณาวิดีโอ
import { VideoView, useVideoPlayer } from "expo-video";
// router สำหรับ navigate หลังปิด ad
import { router } from "expo-router";
// hooks ของ Redux
import { useAppDispatch, useAppSelector } from "../store/hooks";
// actions จาก adsSlice สำหรับจัดการ splash ad
import {
  showSplashAd,         // โหลด ad จาก server
  dismissAd,            // ปิด ad ใน Redux state
  trackImpression,      // บันทึกว่า user เห็น ad แล้ว (สำหรับ analytics)
  setShowingPreHomeAd,  // toggle flag ว่ากำลังแสดง pre-home ad
} from "../store/adsSlice";

// ฟังก์ชันตรวจสอบว่า URL เป็นวิดีโอหรือไม่
// ตรวจจาก path ("/video/upload/") หรือนามสกุล (.mp4, .webm, .mov)
const isVideoUrl = (url: string) =>
  url.includes("/video/upload/") || /\.(mp4|webm|mov)(\?|$)/i.test(url);

// ── Video sub-component (useVideoPlayer must be at top-level of a component) ──
// แยกเป็น component ย่อยเพราะ useVideoPlayer ต้องถูกเรียกที่ top-level ของ component
function AdVideo({ uri, onEnd }: { uri: string; onEnd?: () => void }) {
  // สร้าง player พร้อม config: ไม่วนซ้ำ, เปิดเสียง, และ play ทันที
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;   // เล่นครั้งเดียว ไม่วนซ้ำ
    p.muted = false;  // เปิดเสียง
    p.play();         // เริ่มเล่นทันที
  });

  // ฟัง event เมื่อวิดีโอเล่นจบ → เรียก onEnd เพื่อ navigate ไป home ทันที
  useEffect(() => {
    const sub = player.addListener("playToEnd", () => onEnd?.());
    return () => sub.remove();
  }, []);

  return (
    // VideoView แสดงวิดีโอเต็มพื้นที่ (StyleSheet.absoluteFill = ชิดขอบทุกด้าน)
    // contentFit: "cover" = ครอบคลุมพื้นที่โดยไม่เสียสัดส่วน
    // nativeControls: false = ไม่แสดง play/pause button ของ OS
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

// HomeAdsScreen — หน้า Splash Ad ที่แสดงก่อนเข้าหน้า Home สำหรับ free user
export default function HomeAdsScreen() {
  const dispatch = useAppDispatch();
  // ดึง state ของโฆษณาจาก Redux: ad ปัจจุบัน, สถานะแสดง, context (SPLASH/BETWEEN)
  const { currentAd, adVisible, adContext } = useAppSelector((s) => s.ads);

  // countdown: เวลาถอยหลัง (วินาที) ก่อนที่จะ skip ได้, -1 = ยังไม่เริ่ม
  const [countdown, setCountdown] = useState(-1);
  // canSkip: true เมื่อ countdown ถึง 0 แล้ว
  const [canSkip, setCanSkip] = useState(false);
  // loading: true ขณะกำลังโหลด ad จาก server
  const [loading, setLoading] = useState(true);
  // timerRef: เก็บ setInterval ID เพื่อ clear ตอน cleanup
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // impressionTracked: ป้องกันการบันทึก impression ซ้ำสำหรับ ad เดียวกัน
  const impressionTracked = useRef(false);

  // ── fetch ad on mount ──────────────────────────────────────────────────────
  // โหลด ad จาก server เมื่อ component mount ครั้งแรก
  useEffect(() => {
    dispatch(showSplashAd()).then((result: any) => {
      setLoading(false); // ปิด loading spinner
      if (!result.payload) {
        // ไม่มี ad → ไปหน้า home เลย
        // ล้าง flag pre-home ad และ navigate ไป /home โดยตรง
        dispatch(setShowingPreHomeAd(false));
        router.replace("/home");
      }
    });
    // cleanup: clear timer เมื่อ component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // [] = ทำงานครั้งเดียวตอน mount

  // ── start countdown when ad is ready ──────────────────────────────────────
  // เริ่ม countdown เมื่อ ad พร้อมแสดง (currentAd มีค่า, context เป็น SPLASH, adVisible = true)
  useEffect(() => {
    // ถ้า ad ยังไม่พร้อม หรือ context ไม่ใช่ SPLASH ไม่ต้องนับถอยหลัง
    if (!currentAd || adContext !== "SPLASH" || !adVisible) return;
    // ถ้า impression บันทึกไปแล้ว ไม่ต้องทำซ้ำ
    if (impressionTracked.current) return;

    // บันทึกว่า impression นี้ tracked แล้ว
    impressionTracked.current = true;
    // ส่ง API บันทึกว่า user เห็น ad นี้แล้ว
    dispatch(trackImpression(currentAd.id));

    // ระยะเวลาของ ad (วินาที) ใช้ค่าจาก server หรือ default 5 วินาที
    const duration = currentAd.adDuration ?? 5;
    setCountdown(duration);  // ตั้ง countdown เริ่มต้น
    setCanSkip(false);       // ยังข้ามไม่ได้

    // เริ่ม interval นับถอยหลังทุก 1 วินาที
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // countdown ถึง 0 → หยุด timer และอนุญาตให้ skip
          clearInterval(timerRef.current!);
          setCanSkip(true);
          return 0;
        }
        // ลด countdown ทีละ 1 วินาที
        return prev - 1;
      });
    }, 1000);

    // cleanup: clear timer เมื่อ effect ทำงานใหม่หรือ unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentAd?.id, adVisible]); // ทำงานใหม่เมื่อ ad เปลี่ยนหรือ visibility เปลี่ยน

  // handler เมื่อกดปุ่ม Skip
  const handleSkip = () => {
    if (!canSkip) return; // ป้องกันการ skip ก่อนครบเวลา
    dispatch(dismissAd());               // ปิด ad ใน Redux state
    dispatch(setShowingPreHomeAd(false)); // ล้าง flag pre-home ad
    impressionTracked.current = false;   // reset สำหรับ ad ถัดไป
    router.replace("/home");             // navigate ไปหน้า home
  };

  // handler เมื่อกดบน ad (เปิด link ของผู้โฆษณา)
  const handleAdPress = () => {
    if (currentAd?.linkUrl) {
      // เปิด URL ใน browser ภายนอก, catch error กรณี URL ไม่ valid
      Linking.openURL(currentAd.linkUrl).catch(() => {});
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  // แสดง spinner ขณะรอโหลด ad จาก server
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  // ถ้าไม่มี ad หรือ context ไม่ใช่ SPLASH → render null (ไม่ควรถึงจุดนี้ปกติ)
  if (!currentAd || adContext !== "SPLASH") return null;

  // ตรวจว่า media ของ ad เป็นวิดีโอหรือรูปภาพ
  const isVideo = isVideoUrl(currentAd.imageUrl);

  return (
    <View style={styles.container}>
      {/* StatusBar แบบ translucent ให้ content อยู่ใต้ status bar ได้ */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Full-screen media ── */}
      {/* TouchableOpacity ครอบ media ทั้งหมด เพื่อ handle การกด ad
          activeOpacity: 0.9 ถ้ามี linkUrl, 1 ถ้าไม่มี (ไม่ให้ visual feedback) */}
      <TouchableOpacity
        activeOpacity={currentAd.linkUrl ? 0.9 : 1}
        onPress={handleAdPress}
        style={StyleSheet.absoluteFill} // ครอบเต็มหน้าจอ
      >
        {/* แสดงวิดีโอหรือรูปภาพตาม isVideo */}
        {isVideo ? (
          <AdVideo uri={currentAd.imageUrl} onEnd={handleSkip} />
        ) : (
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover" // ครอบคลุมพื้นที่ไม่เสียสัดส่วน
          />
        )}
      </TouchableOpacity>

      {/* ── Dark overlay gradient (top) ── */}
      {/* overlay สีดำกึ่งโปร่งใสที่ด้านบน เพื่อให้ text อ่านได้ชัดขึ้น
          pointerEvents: "none" ให้ event ผ่านทะลุไปยัง TouchableOpacity ด้านล่าง */}
      <View style={styles.topOverlay} pointerEvents="none" />

      {/* ── Top bar ── */}
      {/* แถบด้านบนแสดง label "HOME Ads" และปุ่ม Skip */}
      <View style={styles.topBar}>
        {/* "HOME Ads" label — แสดงให้ผู้ใช้รู้ว่านี่คือโฆษณา */}
        <Text style={styles.homeAdsLabel}>HOME Ads</Text>

        {/* ปุ่ม Skip — disabled จนกว่า countdown จะถึง 0 */}
        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={canSkip ? 0.8 : 1} // ไม่มี feedback ขณะยังข้ามไม่ได้
          disabled={!canSkip}               // ปิดใช้งานจนกว่าจะ skip ได้
          style={[styles.skipBtn, canSkip && styles.skipBtnReady]} // เปลี่ยน style เมื่อ ready
        >
          {/* ข้อความ: "SKIP Ads" เมื่อ ready, "SKIP Ads X sec" ขณะนับถอยหลัง */}
          <Text style={[styles.skipText, canSkip && styles.skipTextReady]}>
            {canSkip ? "SKIP Ads" : `SKIP Ads ${countdown > 0 ? countdown : "…"} sec`}
          </Text>
          {/* ลูกศร "›" ใน circle เปลี่ยนสีเมื่อ ready */}
          <View style={[styles.skipArrow, canSkip && styles.skipArrowReady]}>
            <Text style={[styles.skipArrowText, canSkip && styles.skipArrowTextReady]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// StyleSheet สำหรับ HomeAdsScreen
const styles = StyleSheet.create({
  // container หลัก: พื้นหลังดำ เต็มหน้าจอ
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // container สำหรับ loading state: กึ่งกลางหน้าจอ
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  // overlay สีดำบนส่วนบนของหน้าจอ ทำให้ text อ่านง่ายขึ้น
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 130, // ครอบ status bar + top bar
    // soft dark gradient from top
    backgroundColor: "transparent",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
  } as any,
  // แถบ top bar: วาง label และปุ่ม Skip ด้านบนของหน้าจอ
  topBar: {
    position: "absolute",
    top: 48,   // อยู่ใต้ status bar
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between", // label ซ้าย, skip ขวา
    alignItems: "center",
    paddingHorizontal: 16,
  },
  // label "HOME Ads" — สีขาวกึ่งโปร่งใส ตัวหนังสือเล็ก
  homeAdsLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  // ปุ่ม Skip ขณะยังนับถอยหลัง — พื้นหลังขาวกึ่งโปร่งใส
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
  // ปุ่ม Skip เมื่อ ready — พื้นหลังขาวทึบ (เน้นให้กดได้)
  skipBtnReady: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "transparent",
  },
  // ข้อความ Skip ขณะนับถอยหลัง — สีขาวกึ่งโปร่งใส
  skipText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  // ข้อความ Skip เมื่อ ready — สีดำ (contrast กับพื้นขาว)
  skipTextReady: {
    color: "#000",
  },
  // circle สำหรับลูกศร "›"
  skipArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  // circle ลูกศรเมื่อ ready — สีดำ
  skipArrowReady: {
    backgroundColor: "#000",
  },
  // ตัวลูกศร "›" ขณะนับถอยหลัง
  skipArrowText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    marginTop: -1, // ปรับให้ลูกศรอยู่กึ่งกลาง circle แนวตั้ง
  },
  // ตัวลูกศรเมื่อ ready — สีขาว
  skipArrowTextReady: {
    color: "#fff",
  },
});
