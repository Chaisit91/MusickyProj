import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { restoreSession } from "../store/authSlice";
import AudioController from "../Components/player/AudioController";

function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const segments = useSegments();

  // Restore session from AsyncStorage on app start
  useEffect(() => {
    dispatch(restoreSession());
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] as string | undefined;
    const publicRoutes = [undefined, "index", "login", "register"];
    const isOnPublicRoute = publicRoutes.includes(currentRoute as string);

    if (isLoggedIn && isOnPublicRoute) {
      router.replace("/home");
    } else if (!isLoggedIn && !isOnPublicRoute) {
      router.replace("/login");
    }
  }, [isLoggedIn, isLoading, segments]);

  return (
    <>
      <AudioController />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
