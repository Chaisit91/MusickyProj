import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch } from "../../store/hooks";
import { loginThunk } from "../../store/authSlice";
import axios from "axios";

// ─── Dot badge (same as WelcomeScreen) ───────────────────────────────────────
const Dots = () => (
  <View className="flex-row items-center ml-2" style={{ gap: 4 }}>
    <View className="w-3 h-3 rounded-full bg-green-800" />
    <View className="w-3 h-3 rounded-full bg-green-700" />
    <View className="w-4 h-4 rounded-full bg-green-500" />
  </View>
);

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    {visible ? (
      <Path
        fill="#888"
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      />
    ) : (
      <Path
        fill="#888"
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
      />
    )}
  </Svg>
);

export default function LoginScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(loginThunk({ email: email.trim(), password }));
      if (loginThunk.rejected.match(result)) {
        setError(result.payload as string);
      }
      // _layout.tsx จัดการ redirect ไป /home อัตโนมัติเมื่อ isLoggedIn = true
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Cannot reach server (${err.message})`);
      } else {
        setError("Unexpected error occurred");
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
            flex: 1,
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
          <Text
            style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 40, marginBottom: 8 }}
          >
            Log in
          </Text>
          <Text style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
            Welcome back
          </Text>

          {/* ── Email ── */}
          <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>Email</Text>
          <TextInput
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "#fff",
              fontSize: 15,
              borderWidth: 1,
              borderColor: "#2a2a2a",
              marginBottom: 16,
            }}
            placeholder="your@gmail.com"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* ── Password ── */}
          <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>Password</Text>
          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                paddingRight: 48,
                color: "#fff",
                fontSize: 15,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}
            >
              <EyeIcon visible={showPassword} />
            </TouchableOpacity>
          </View>

          {/* ── Error ── */}
          {error ? (
            <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              {error}
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
            onPress={handleLogin}
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

          {/* ── Sign Up Link ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
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
