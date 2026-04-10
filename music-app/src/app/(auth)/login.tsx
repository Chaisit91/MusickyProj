import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path, G, ClipPath, Defs, Rect } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useAppDispatch } from "../../store/hooks";
import { loginThunk, googleLoginThunk } from "../../store/authSlice";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../schema/authSchema";
import { FormInput } from "../../Components/ui/FormInput";
import { FormPasswordInput } from "../../Components/ui/FormPasswordInput";

WebBrowser.maybeCompleteAuthSession();

// ─── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Defs>
      <ClipPath id="clip">
        <Rect width={48} height={48} />
      </ClipPath>
    </Defs>
    <G clipPath="url(#clip)">
      <Path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.2z" />
      <Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.9 14.8 48 24 48z" />
      <Path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.7-2.8-.7-4.3s.3-3 .7-4.3v-6.2H2.7C1 17.3 0 20.5 0 24s1 6.7 2.7 9.5l8.1-4.7z" />
      <Path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.4 30.5 0 24 0 14.8 0 6.7 5.1 2.7 12.5l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z" />
    </G>
  </Svg>
);

// ─── Dot badge ────────────────────────────────────────────────────────────────
const Dots = () => (
  <View className="flex-row items-center ml-2" style={{ gap: 4 }}>
    <View className="w-3 h-3 rounded-full bg-green-800" />
    <View className="w-3 h-3 rounded-full bg-green-700" />
    <View className="w-4 h-4 rounded-full bg-green-500" />
  </View>
);

type LoginForm = z.infer<typeof loginSchema>;

// ─── REPLACE with your real Client IDs from Google Cloud Console ──────────────
// https://console.cloud.google.com/ → APIs & Services → Credentials
const GOOGLE_WEB_CLIENT_ID = "390954514798-7i5kqfklel0dd5csvpbi3v6ovcepf0c6.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID = "390954514798-v6u0toepv9iob5gmpq0feh1j15on23hj.apps.googleusercontent.com";

export default function LoginScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const dispatch = useAppDispatch();

  // ── Google Auth ──────────────────────────────────────────────────────────
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) handleGoogleToken(accessToken);
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    setGoogleLoading(true);
    setServerError("");
    try {
      const result = await dispatch(googleLoginThunk({ accessToken }));
      if (googleLoginThunk.fulfilled.match(result)) {
        if (result.payload.requiresName) {
          // user ใหม่ → ไปหน้าตั้งชื่อ
          const { googleData } = result.payload;
          router.replace({
            pathname: "/set-username",
            params: {
              accessToken: googleData.accessToken,
              email: googleData.email,
              suggestedName: googleData.suggestedName,
              avatarUrl: googleData.avatarUrl ?? "",
            },
          });
        }
        // requiresName=false → AuthGuard จะ redirect ไป /home เอง
      } else {
        setServerError((result.payload as string) ?? "Google login failed");
      }
    } catch {
      setServerError("Unable to connect to server");
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    setLoading(true);
    try {
      const result = await dispatch(loginThunk({ email: data.email.trim(), password: data.password }));
      if (loginThunk.rejected.match(result)) {
        const msg = (result.payload as string) || "Invalid email or password";
        setError("email", { message: " " });
        setError("password", { message: msg });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setServerError(`Cannot reach server (${err.message})`);
      } else {
        setServerError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111111" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            flexGrow: 1,
            paddingHorizontal: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ── Logo ── */}
          <View className="flex-row mt-16 items-center">
            <Text className="text-white text-4xl font-bold">Musicky</Text>
            <Dots />
          </View>

          {/* ── Title ── */}
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 40, marginBottom: 8  }}>
            Log in
          </Text>
          <Text style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
            Welcome back
          </Text>

          {/* ── Email ── */}
          <FormInput
            control={control}
            name="email"
            label="Email"
            placeholder="your@gmail.com"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* ── Password ── */}
          <FormPasswordInput
            control={control}
            name="password"
            label="Password"
            placeholder="Password"
            error={errors.password}
          />

          {/* ── Server Error ── */}
          {serverError ? (
            <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              {serverError}
            </Text>
          ) : null}

          {/* ── Login Button ── */}
          <TouchableOpacity
            style={{
              backgroundColor: "#d4d4d4",
              borderRadius: 50,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 12,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ color: "#000", fontWeight: "600", fontSize: 15, letterSpacing: 0.5 }}>
                Log in
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "#2a2a2a" }} />
            <Text style={{ color: "#555", fontSize: 13, marginHorizontal: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#2a2a2a" }} />
          </View>

          {/* ── Google Login Button ── */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1e1e1e",
              borderRadius: 50,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: "#2a2a2a",
              gap: 10,
              opacity: googleLoading ? 0.7 : 1,
            }}
            onPress={() => promptAsync()}
            activeOpacity={0.85}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Sign Up Link ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
            <Text style={{ color: "#888", fontSize: 14 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/register")} activeOpacity={0.7}>
              <Text style={{ color: "#d4d4d4", fontSize: 14, fontWeight: "600" }}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* ── Back ── */}
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={{ alignItems: "center", marginTop: 20, paddingBottom: 40 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#555", fontSize: 13 }}>← Back</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
