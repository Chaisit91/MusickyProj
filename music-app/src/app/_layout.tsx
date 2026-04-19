// Root layout — ครอบ Redux Provider, StatusBar, OfflineBanner, AudioController (global player), BetweenSongAd (global modal), AuthGuard (redirect login/home ตาม auth state + splash ad)
//
// หลักการทำงาน:
// 1. RootLayout: ครอบ ErrorBoundary → GestureHandlerRootView → Redux Provider → RootLayoutNav
// 2. RootLayoutNav mount: dispatch restoreSkips, restoreSession → ถ้ามี session dispatch loadPreferences
// 3. AppState listener (เฉพาะตอน login): เมื่อ app กลับ foreground dispatch fetchMeThunk → sync premium status
// 4. AuthGuard: ดู isLoggedIn + isLoading + segments + showingPreHomeAd → redirect login หรือ home
//    - login แล้ว + public route + !showingPreHomeAd → replace("/home")
//    - ยังไม่ login + protected route → replace("/login")
// 5. AudioController + BetweenSongAd + OfflineBanner วางใน root ทำงานตลอดทุกหน้า

// นำเข้า hook useEffect สำหรับรัน side-effect หลัง render
import { useEffect } from "react";
// นำเข้า AppState เพื่อตรวจสอบว่าแอปอยู่ใน foreground/background
import { AppState } from "react-native";
// นำเข้า Stack (navigator), useRouter (navigate), useSegments (ดู path ปัจจุบัน) จาก expo-router
import { Stack, useRouter, useSegments } from "expo-router";
// นำเข้า global CSS (NativeWind / Tailwind)
import "../../global.css";
// นำเข้า Provider เพื่อครอบ Redux store ให้ทุก component ใช้ได้
import { Provider } from "react-redux";
// นำเข้า GestureHandlerRootView รองรับ gesture ทั่วทั้งแอป (ต้องครอบ root เสมอ)
import { GestureHandlerRootView } from "react-native-gesture-handler";
// นำเข้า Redux store หลักของแอป
import { store } from "../store/store";
// นำเข้า typed hook สำหรับ dispatch และ selector
import { useAppDispatch, useAppSelector } from "../store/hooks";
// นำเข้า thunk และ action สำหรับ auth
import { restoreSession, fetchMeThunk } from "../store/authSlice";
// นำเข้า action โหลด preferences (คุณภาพเสียง, ภาษา ฯลฯ) จาก AsyncStorage
import { loadPreferences } from "../store/preferencesSlice";
// นำเข้า action restore จำนวน skip ที่เหลือ (เพลง free skip)
import { restoreSkips } from "../store/skipSlice";
// นำเข้า AudioController — component ที่รับผิดชอบการเล่นเพลง (expo-av) ทั้งแอป
import AudioController from "../Components/player/AudioController";
// นำเข้า BetweenSongAd — โฆษณาที่แสดงระหว่างเพลง (สำหรับ free user)
import BetweenSongAd from "../Components/ads/BetweenSongAd";
// นำเข้า OfflineBanner — banner แสดงเมื่อไม่มีอินเทอร์เน็ต
import OfflineBanner from "../Components/ui/OfflineBanner";
// นำเข้า ErrorBoundary — จับ error ที่ไม่ได้ handle ไม่ให้แอปพัง
import ErrorBoundary from "../Components/ui/ErrorBoundary";

// ─── Public route segments (no login required) ────────────────────────────────
// "(auth)" covers the entire (auth) route group: /login, /register
// กำหนด path segment ที่ไม่ต้องการ login เพื่อใช้ใน AuthGuard ด้านล่าง
const PUBLIC_SEGMENTS = new Set<string | undefined>([undefined, "index", "(auth)"]);

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Handles redirect logic separately from layout rendering.
// • Logged-in user on a public route  → push to /home
// • Guest on a protected route        → push to /login
// AuthGuard คือ component ที่ไม่ render UI แต่คอยตรวจ state และ redirect
function AuthGuard() {
  // ดึงสถานะ login และ loading จาก Redux auth slice
  const { isLoggedIn, isLoading } = useAppSelector((s) => s.auth);
  // ดึงสถานะ showingPreHomeAd — true หมายความว่ากำลังแสดง splash ad อยู่
  const showingPreHomeAd = useAppSelector((s) => s.ads.showingPreHomeAd);
  // useRouter ใช้ navigate โดยไม่ต้องมี UI
  const router = useRouter();
  // useSegments คืน array ของ path segment ปัจจุบัน เช่น ["(main)", "home"]
  const segments = useSegments();

  // ทำงานทุกครั้งที่ isLoggedIn, isLoading, segments หรือ showingPreHomeAd เปลี่ยน
  useEffect(() => {
    // ถ้า auth ยังโหลดอยู่ ยังไม่ redirect
    if (isLoading) return;

    // ดึง root segment แรก เช่น "(auth)", "(main)", undefined (welcome screen)
    const rootSegment = segments[0] as string | undefined;
    // ตรวจว่า path ปัจจุบันเป็น public route หรือไม่
    const isPublic = PUBLIC_SEGMENTS.has(rootSegment);

    if (isLoggedIn && isPublic) {
      // Don't redirect yet — splash ad screen will navigate to home when done
      // ถ้ากำลังแสดง pre-home ad อยู่ ให้รอ ad ทำการ navigate เอง
      if (showingPreHomeAd) return;
      // เข้าสู่ระบบแล้วแต่อยู่ที่ public route → ไปหน้า home
      router.replace("/home");
    } else if (!isLoggedIn && !isPublic) {
      // ยังไม่ login แต่พยายามเข้า protected route → ไปหน้า login
      router.replace("/login");
    }
  }, [isLoggedIn, isLoading, segments, showingPreHomeAd]);

  // ไม่ render UI ใดๆ — ทำหน้าที่แค่ redirect logic
  return null;
}

// ─── Root Layout Nav ──────────────────────────────────────────────────────────
// Restores session from AsyncStorage on app start,
// then renders the global AudioController + root Stack.
// RootLayoutNav คือ layout หลักที่โหลด session และ render navigation stack
function RootLayoutNav() {
  // ใช้ dispatch เพื่อ trigger thunk
  const dispatch = useAppDispatch();
  // ดึงสถานะ login เพื่อ subscribe ฟัง AppState change เฉพาะตอน login
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);

  // ทำงานครั้งเดียวตอน mount — restore session และ preferences
  useEffect(() => {
    // restore skip count ที่บันทึกไว้ใน AsyncStorage
    dispatch(restoreSkips());
    // restore token/user จาก AsyncStorage ถ้ายังไม่หมดอายุ
    dispatch(restoreSession()).then((result) => {
      // ถ้า restore session สำเร็จ (มี payload) → โหลด preferences เพิ่มเติม
      if (restoreSession.fulfilled.match(result) && result.payload) {
        dispatch(loadPreferences());
      }
    });
  }, []);

  // เช็คสถานะ Premium ทุกครั้งที่ app กลับมา foreground
  // เหตุผล: admin อาจ activate/expire premium บน backend ขณะที่แอปอยู่ background
  useEffect(() => {
    // ถ้ายังไม่ login ไม่ต้องติดตาม AppState
    if (!isLoggedIn) return;
    // subscribe ฟัง AppState change (active/background/inactive)
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        // แอปกลับมา foreground → ดึงข้อมูล user ใหม่เพื่ออัปเดต isPremium
        dispatch(fetchMeThunk());
      }
    });
    // cleanup: ลบ listener เมื่อ component unmount หรือ isLoggedIn เปลี่ยน
    return () => sub.remove();
  }, [isLoggedIn]);

  return (
    <>
      {/* AuthGuard: ไม่มี UI แค่จัดการ redirect */}
      <AuthGuard />
      {/* AudioController: ควบคุมการเล่นเพลงทั่วแอป ต้องวางไว้ที่ root */}
      <AudioController />
      {/* BetweenSongAd: modal โฆษณาระหว่างเพลง (free user) */}
      <BetweenSongAd />
      {/* OfflineBanner: แถบแจ้งเตือนเมื่ออินเทอร์เน็ตหลุด */}
      <OfflineBanner />
      {/* Stack navigator หลัก — headerShown: false ซ่อน header ทุกหน้า
          animation: "fade" + duration 200ms สำหรับ transition ระหว่างหน้า */}
      <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 200 }} />
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Wraps the entire app with the Redux store.
// Root component ที่ export เป็น entry point ของ app
export default function RootLayout() {
  return (
    // ErrorBoundary: จับ error ที่ไม่ได้ handle ป้องกันแอปพัง
    <ErrorBoundary>
      {/* GestureHandlerRootView: ต้องครอบ root เพื่อให้ gesture ทำงานได้ทั่วแอป
          flex: 1 ให้ใช้พื้นที่เต็มหน้าจอ */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Provider: ส่ง Redux store ให้ทุก component ที่ต้องการ */}
        <Provider store={store}>
          {/* RootLayoutNav: layout หลักที่มี AuthGuard + navigation */}
          <RootLayoutNav />
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
