import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] as string | undefined;
    const publicRoutes = [undefined, "index", "login", "register"];
    const isOnPublicRoute = publicRoutes.includes(currentRoute as string);

    if (isLoggedIn && isOnPublicRoute) {
      // Already logged in → go to home
      router.replace("/home");
    } else if (!isLoggedIn && !isOnPublicRoute) {
      // Not logged in → go to login
      router.replace("/login");
    }
  }, [isLoggedIn, isLoading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
