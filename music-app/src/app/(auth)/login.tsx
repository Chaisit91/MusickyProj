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
import { useAppDispatch } from "../../store/hooks";
import { loginThunk } from "../../store/authSlice";
import { loadPreferences } from "../../store/preferencesSlice";
import { showSplashAd, setShowingPreHomeAd } from "../../store/adsSlice";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../schema/authSchema";
import { FormInput } from "../../Components/ui/FormInput";
import { FormPasswordInput } from "../../Components/ui/FormPasswordInput";

// ─── Dot badge ────────────────────────────────────────────────────────────────
const Dots = () => (
  <View className="flex-row items-center ml-2" style={{ gap: 4 }}>
    <View className="w-3 h-3 rounded-full bg-green-800" />
    <View className="w-3 h-3 rounded-full bg-green-700" />
    <View className="w-4 h-4 rounded-full bg-green-500" />
  </View>
);

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

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
      } else {
        dispatch(loadPreferences());
        const user = (result.payload as any)?.user;
        console.log("[Login] user:", user?.email, "isPremium:", user?.isPremium);
        if (!user?.isPremium) {
          // Block AuthGuard from navigating to home — ad screen will navigate instead
          dispatch(setShowingPreHomeAd(true));
          console.log("[Login] dispatching showSplashAd");
          dispatch(showSplashAd());
        }
      }
    } catch (err) {
      dispatch(setShowingPreHomeAd(false));
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
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 40, marginBottom: 8 }}>
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

          {/* ── Forgot Password ── */}
          <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            style={{ alignItems: "flex-end", marginBottom: 24, marginTop: -8 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#888", fontSize: 13 }}>ลืมรหัสผ่าน?</Text>
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
