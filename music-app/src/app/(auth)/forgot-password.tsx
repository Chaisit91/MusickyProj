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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotEmailSchema,
  resetPasswordSchema,
  type ForgotEmailForm,
  type ResetPasswordForm,
} from "../../schema/authSchema";
import { forgotPasswordApi, resetPasswordApi } from "../../api/authApi";

type Step = "email" | "otp" | "success";

const inputStyle = (hasError: boolean) => ({
  backgroundColor: "#1e1e1e",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: "#fff",
  fontSize: 15,
  borderWidth: 1,
  borderColor: hasError ? "#ff4444" : "#2a2a2a",
});

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const emailForm = useForm<ForgotEmailForm>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const handleRequestOtp = emailForm.handleSubmit(async (data) => {
    setApiError("");
    setLoading(true);
    try {
      const res = await forgotPasswordApi(data.email.trim().toLowerCase());
      if (res.data?.otp) setDevOtp(res.data.otp);
      setSubmittedEmail(data.email.trim().toLowerCase());
      setStep("otp");
    } catch (err: any) {
      setApiError(err.response?.data?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  });

  const handleResetPassword = resetForm.handleSubmit(async (data) => {
    setApiError("");
    setLoading(true);
    try {
      await resetPasswordApi(submittedEmail, data.otp.trim(), data.newPassword);
      setStep("success");
    } catch (err: any) {
      setApiError(err.response?.data?.message ?? "รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  });

  const { errors: eErr } = emailForm.formState;
  const { errors: rErr } = resetForm.formState;

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
              <Controller
                control={emailForm.control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={(v) => { onChange(v); setApiError(""); }}
                    onBlur={onBlur}
                    placeholder="your@gmail.com"
                    placeholderTextColor="#555"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ ...inputStyle(!!eErr.email), marginBottom: 4 }}
                  />
                )}
              />
              {eErr.email && (
                <Text style={{ color: "#ff4444", fontSize: 12, marginBottom: 8 }}>{eErr.email.message}</Text>
              )}
              {apiError ? (
                <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 16 }}>{apiError}</Text>
              ) : <View style={{ marginBottom: 16 }} />}

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

              {/* OTP */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>รหัส OTP</Text>
                <Controller
                  control={resetForm.control}
                  name="otp"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={(v) => { onChange(v); setApiError(""); }}
                      onBlur={onBlur}
                      placeholder="000000"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      style={inputStyle(!!rErr.otp)}
                    />
                  )}
                />
                {rErr.otp && <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{rErr.otp.message}</Text>}
              </View>

              {/* New Password */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>รหัสผ่านใหม่</Text>
                <Controller
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      placeholderTextColor="#555"
                      secureTextEntry
                      style={inputStyle(!!rErr.newPassword)}
                    />
                  )}
                />
                {rErr.newPassword && <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{rErr.newPassword.message}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>ยืนยันรหัสผ่าน</Text>
                <Controller
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="กรอกซ้ำอีกครั้ง"
                      placeholderTextColor="#555"
                      secureTextEntry
                      style={inputStyle(!!rErr.confirmPassword)}
                    />
                  )}
                />
                {rErr.confirmPassword && <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{rErr.confirmPassword.message}</Text>}
              </View>

              {apiError ? <Text style={{ color: "#ff4444", fontSize: 13, marginBottom: 12 }}>{apiError}</Text> : null}

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
