import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { forgotPasswordApi, resetPasswordApi } from "../../api/authApi";

type Step = "email" | "otp" | "success";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState(""); // OTP จาก backend (dev mode)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setError("");
    if (!email.trim()) { setError("กรุณากรอกอีเมล"); return; }
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email.trim().toLowerCase());
      if (res.data?.otp) setDevOtp(res.data.otp); // แสดงใน dev mode
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!otp.trim()) { setError("กรุณากรอกรหัส OTP"); return; }
    if (newPassword.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (newPassword !== confirmPassword) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    setLoading(true);
    try {
      await resetPasswordApi(email.trim().toLowerCase(), otp.trim(), newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
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
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80 }}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }} activeOpacity={0.7}>
            <Text style={{ color: "#555", fontSize: 13 }}>← กลับ</Text>
          </TouchableOpacity>

          {step === "email" && (
            <>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
                ลืมรหัสผ่าน?
              </Text>
              <Text style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
                กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งรหัส OTP ให้
              </Text>

              <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>อีเมล</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@gmail.com"
                placeholderTextColor="#555"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: "#fff",
                  fontSize: 15,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                }}
              />

              {error ? <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 16 }}>{error}</Text> : null}

              <TouchableOpacity
                onPress={handleRequestOtp}
                disabled={loading}
                style={{
                  backgroundColor: "#d4d4d4",
                  borderRadius: 50,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: loading ? 0.7 : 1,
                }}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <Text style={{ color: "#000", fontWeight: "600", fontSize: 15 }}>ส่งรหัส OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
                ตั้งรหัสผ่านใหม่
              </Text>
              <Text style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
                กรอกรหัส OTP และรหัสผ่านใหม่
              </Text>

              {/* Dev mode: แสดง OTP */}
              {devOtp ? (
                <View style={{
                  backgroundColor: "#1a2a1a",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#2d4a2d",
                }}>
                  <Text style={{ color: "#4ade80", fontSize: 12, marginBottom: 4 }}>🔑 Dev mode — รหัส OTP ของคุณ:</Text>
                  <Text style={{ color: "#86efac", fontSize: 24, fontWeight: "700", letterSpacing: 6 }}>{devOtp}</Text>
                  <Text style={{ color: "#555", fontSize: 11, marginTop: 4 }}>หมดอายุใน 5 นาที</Text>
                </View>
              ) : null}

              {[
                { label: "รหัส OTP", value: otp, setter: setOtp, placeholder: "000000", keyboardType: "numeric" as const },
                { label: "รหัสผ่านใหม่", value: newPassword, setter: setNewPassword, placeholder: "อย่างน้อย 8 ตัวอักษร", secure: true },
                { label: "ยืนยันรหัสผ่าน", value: confirmPassword, setter: setConfirmPassword, placeholder: "กรอกซ้ำอีกครั้ง", secure: true },
              ].map((field) => (
                <View key={field.label} style={{ marginBottom: 16 }}>
                  <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>{field.label}</Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor="#555"
                    keyboardType={field.keyboardType}
                    secureTextEntry={field.secure}
                    style={{
                      backgroundColor: "#1e1e1e",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      color: "#fff",
                      fontSize: 15,
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                    }}
                  />
                </View>
              ))}

              {error ? <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 12 }}>{error}</Text> : null}

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                style={{
                  backgroundColor: "#d4d4d4",
                  borderRadius: 50,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginTop: 8,
                  opacity: loading ? 0.7 : 1,
                }}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <Text style={{ color: "#000", fontWeight: "600", fontSize: 15 }}>รีเซ็ตรหัสผ่าน</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === "success" && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
              <Text style={{ fontSize: 56, marginBottom: 24 }}>✅</Text>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
                รีเซ็ตสำเร็จ!
              </Text>
              <Text style={{ color: "#888", fontSize: 14, textAlign: "center", marginBottom: 40 }}>
                รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว{"\n"}กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={{
                  backgroundColor: "#d4d4d4",
                  borderRadius: 50,
                  paddingHorizontal: 40,
                  paddingVertical: 14,
                }}
                activeOpacity={0.85}
              >
                <Text style={{ color: "#000", fontWeight: "600", fontSize: 15 }}>ไปที่หน้า Login</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
