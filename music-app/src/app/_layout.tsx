import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { restoreSession, fetchMeThunk } from "../store/authSlice";
import { loadPreferences } from "../store/preferencesSlice";
import AudioController from "../Components/player/AudioController";
import SplashAdModal from "../Components/ads/SplashAdModal";
import BetweenSongAd from "../Components/ads/BetweenSongAd";
import OfflineBanner from "../Components/ui/OfflineBanner";
import ErrorBoundary from "../Components/ui/ErrorBoundary";

// ─── Public route segments (no login required) ────────────────────────────────
// "(auth)" covers the entire (auth) route group: /login, /register
const PUBLIC_SEGMENTS = new Set<string | undefined>([undefined, "index", "(auth)"]);

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Handles redirect logic separately from layout rendering.
// • Logged-in user on a public route  → push to /home
// • Guest on a protected route        → push to /login
function AuthGuard() {
  const { isLoggedIn, isLoading } = useAppSelector((s) => s.auth);
  const showingPreHomeAd = useAppSelector((s) => s.ads.showingPreHomeAd);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const rootSegment = segments[0] as string | undefined;
    const isPublic = PUBLIC_SEGMENTS.has(rootSegment);

    if (isLoggedIn && isPublic) {
      // Don't redirect yet — splash ad screen will navigate to home when done
      if (showingPreHomeAd) return;
      router.replace("/home");
    } else if (!isLoggedIn && !isPublic) {
      router.replace("/login");
    }
  }, [isLoggedIn, isLoading, segments, showingPreHomeAd]);

  return null;
}

// ─── Root Layout Nav ──────────────────────────────────────────────────────────
// Restores session from AsyncStorage on app start,
// then renders the global AudioController + root Stack.
function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);

  useEffect(() => {
    dispatch(restoreSession()).then((result) => {
      if (restoreSession.fulfilled.match(result) && result.payload) {
        dispatch(loadPreferences());
      }
    });
  }, []);

  // เช็คสถานะ Premium ทุกครั้งที่ app กลับมา foreground
  useEffect(() => {
    if (!isLoggedIn) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        dispatch(fetchMeThunk());
      }
    });
    return () => sub.remove();
  }, [isLoggedIn]);

  return (
    <>
      <AuthGuard />
      <AudioController />
      <SplashAdModal />
      <BetweenSongAd />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 200 }} />
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Wraps the entire app with the Redux store.
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <RootLayoutNav />
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
