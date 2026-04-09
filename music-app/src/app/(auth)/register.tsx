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
import { registerApi } from "../../api/authApi";
import axios from "axios";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSchema } from "../../schema/authSchema";



// ─── Dot badge ───────────────────────────────────────────────────────────────
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

// ─── Password Strength Indicator ──────────────────────────────────────────────
const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const label = strength <= 1 ? "Weak" : strength <= 3 ? "Fair" : "Strong";
  const color = strength <= 1 ? "#ff4444" : strength <= 3 ? "#f5a623" : "#4caf50";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            backgroundColor: i <= strength ? color : "#2a2a2a",
          }}
        />
      ))}
      <Text style={{ color, fontSize: 11, marginLeft: 4 }}>{label}</Text>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── react-hook-form setup ────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ── useWatch: watch password in real-time for strength indicator ─────────
  const watchedPassword = useWatch({ control, name: "password" });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Submit handler ───────────────────────────────────────────────────────
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setServerError("");
    setLoading(true);
    try {
      await registerApi({ name: data.name.trim(), email: data.email.trim(), password: data.password });
      router.replace("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg: string = err.response?.data?.message ?? "Registration failed";
        const isEmailTaken =
          err.response?.status === 409 ||
          msg.toLowerCase().includes("email") ||
          msg.toLowerCase().includes("already");
        if (isEmailTaken) {
          setError("email", { message: "This email is already registered" });
        } else {
          setServerError(msg);
        }
      } else {
        setServerError("Unable to connect to server");
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Logo ── */}
          <View className="flex-row mt-16 items-center">
            <Text className="text-white text-4xl font-bold">Musicky</Text>
            <Dots />
          </View>

          {/* ── Title ── */}
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 40, marginBottom: 8 }}>
            Create account
          </Text>
          <Text style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
            Join Musicky today
          </Text>

          {/* ── Name ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: "#1e1e1e",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: "#fff",
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: errors.name ? "#ff4444" : "#2a2a2a",
                  }}
                  placeholder="Your name"
                  placeholderTextColor="#555"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            />
            {errors.name && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{errors.name.message}</Text>
            )}
          </View>

          {/* ── Email ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: "#1e1e1e",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: "#fff",
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: errors.email ? "#ff4444" : "#2a2a2a",
                  }}
                  placeholder="your@gmail.com"
                  placeholderTextColor="#555"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            {errors.email && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>
            )}
          </View>

          {/* ── Password ── */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={{ position: "relative" }}>
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
                      borderColor: errors.password ? "#ff4444" : "#2a2a2a",
                    }}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#555"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}
                  >
                    <EyeIcon visible={showPassword} />
                  </TouchableOpacity>
                </View>
              )}
            />
            {/* useWatch — real-time password strength */}
            <PasswordStrength password={watchedPassword} />
            {errors.password && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{errors.password.message}</Text>
            )}
          </View>

          {/* ── Confirm Password ── */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <View style={{ position: "relative" }}>
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
                      borderColor: errors.confirmPassword ? "#ff4444" : "#2a2a2a",
                    }}
                    placeholder="Repeat your password"
                    placeholderTextColor="#555"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm((v) => !v)}
                    style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}
                  >
                    <EyeIcon visible={showConfirm} />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* ── Quick-fill demo (setValue) ── */}
          <TouchableOpacity
            onPress={() => {
              setValue("name", "Test User", { shouldValidate: true });
              setValue("email", "test@gmail.com", { shouldValidate: true });
              setValue("password", "Test1234!", { shouldValidate: true });
              setValue("confirmPassword", "Test1234!", { shouldValidate: true });
            }}
            style={{ alignSelf: "flex-end", marginBottom: 16 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#555", fontSize: 12 }}>Fill test data</Text>
          </TouchableOpacity>

          {/* ── Server Error ── */}
          {serverError ? (
            <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              {serverError}
            </Text>
          ) : null}

          {/* ── Register Button ── */}
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
                Sign up
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Login Link ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
            <Text style={{ color: "#888", fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")} activeOpacity={0.7}>
              <Text style={{ color: "#d4d4d4", fontSize: 14, fontWeight: "600" }}>Log in</Text>
            </TouchableOpacity>
          </View>

          {/* ── Back ── */}
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={{ alignItems: "center", marginTop: 20 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#555", fontSize: 13 }}>← Back</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
