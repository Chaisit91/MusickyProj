import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { restoreSession } from "../store/authSlice";
import AudioController from "../Components/player/AudioController";

// ─── Public route segments (no login required) ────────────────────────────────
// "(auth)" covers the entire (auth) route group: /login, /register
const PUBLIC_SEGMENTS = new Set<string | undefined>([undefined, "index", "(auth)"]);

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Handles redirect logic separately from layout rendering.
// • Logged-in user on a public route  → push to /home
// • Guest on a protected route        → push to /login
function AuthGuard() {
  const { isLoggedIn, isLoading } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const rootSegment = segments[0] as string | undefined;
    const isPublic = PUBLIC_SEGMENTS.has(rootSegment);

    if (isLoggedIn && isPublic) {
      router.replace("/home");
    } else if (!isLoggedIn && !isPublic) {
      router.replace("/login");
    }
  }, [isLoggedIn, isLoading, segments]);

  return null;
}

// ─── Root Layout Nav ──────────────────────────────────────────────────────────
// Restores session from AsyncStorage on app start,
// then renders the global AudioController + root Stack.
function RootLayoutNav() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, []);

  return (
    <>
      <AuthGuard />
      <AudioController />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Wraps the entire app with the Redux store.
export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
