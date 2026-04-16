import React, { useState } from "react";
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setUsernameSchema, type SetUsernameForm } from "../../schema/authSchema";
import { useAppDispatch } from "../../store/hooks";
import { googleLoginThunk } from "../../store/authSlice";
import { Image } from "expo-image";

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

export default function SetUsernameScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    accessToken: string;
    email: string;
    suggestedName: string;
    avatarUrl: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const { control, handleSubmit, watch, formState: { errors } } = useForm<SetUsernameForm>({
    resolver: zodResolver(setUsernameSchema),
    defaultValues: { name: params.suggestedName ?? "" },
  });

  const nameValue = watch("name");
  const initial = (nameValue?.charAt(0) ?? "?").toUpperCase();
  const avatarUri = params.avatarUrl || null;

  const handleConfirm = handleSubmit(async (data) => {
    setApiError("");
    setLoading(true);
    const result = await dispatch(
      googleLoginThunk({ accessToken: params.accessToken, name: data.name.trim() })
    );
    setLoading(false);
    if (googleLoginThunk.rejected.match(result)) {
      setApiError((result.payload as string) ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
    // fulfilled + requiresName=false → AuthGuard redirect ไป /home เอง
  });

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
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{ marginTop: 56, alignSelf: "flex-start" }}
        >
          <BackIcon />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginTop: 32, marginBottom: 32 }}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                borderWidth: 3,
                borderColor: "#2a2a2a",
              }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: "#5b4fcf",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: "#2a2a2a",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 36, fontWeight: "700" }}>{initial}</Text>
            </View>
          )}
          <Text style={{ color: "#888", fontSize: 13, marginTop: 10 }}>{params.email}</Text>
        </View>

        {/* Title */}
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 8 }}>
          ตั้งชื่อผู้ใช้
        </Text>
        <Text style={{ color: "#888", fontSize: 14, marginBottom: 32, lineHeight: 22 }}>
          เลือกชื่อที่จะแสดงในแอป{"\n"}คุณสามารถเปลี่ยนได้ภายหลังในการตั้งค่า
        </Text>

        {/* Input */}
        <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>ชื่อผู้ใช้</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={(v) => { onChange(v); setApiError(""); }}
              onBlur={onBlur}
              placeholder="ชื่อของคุณ"
              placeholderTextColor="#555"
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 15,
                color: "#fff",
                fontSize: 16,
                borderWidth: 1,
                borderColor: errors.name ? "#ff4444" : "#2a2a2a",
                marginBottom: 4,
              }}
            />
          )}
        />
        {errors.name ? (
          <Text style={{ color: "#ff4444", fontSize: 12, marginBottom: 16 }}>{errors.name.message}</Text>
        ) : apiError ? (
          <Text style={{ color: "#ff4444", fontSize: 12, marginBottom: 16 }}>{apiError}</Text>
        ) : (
          <View style={{ height: 20 }} />
        )}

        {/* Confirm button */}
        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={loading}
          style={{
            backgroundColor: "#4285F4",
            borderRadius: 50,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              เริ่มใช้งาน Musicky
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
