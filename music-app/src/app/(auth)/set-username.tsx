import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAppDispatch } from "../../store/hooks";
import { googleLoginThunk } from "../../store/authSlice";

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

  const [name, setName] = useState(params.suggestedName ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้");
      return;
    }
    if (name.trim().length < 2) {
      setError("ชื่อต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }
    setError("");
    setLoading(true);
    const result = await dispatch(
      googleLoginThunk({ accessToken: params.accessToken, name: name.trim() })
    );
    setLoading(false);
    if (googleLoginThunk.rejected.match(result)) {
      setError((result.payload as string) ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
    // fulfilled + requiresName=false → AuthGuard redirect ไป /home เอง
  };

  const avatarUri = params.avatarUrl || null;
  const initial = name.charAt(0).toUpperCase() || "?";

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
              resizeMode="cover"
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
        <TextInput
          value={name}
          onChangeText={(v) => { setName(v); setError(""); }}
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
            borderColor: error ? "#ff4444" : "#2a2a2a",
            marginBottom: 4,
          }}
        />
        {error ? (
          <Text style={{ color: "#ff4444", fontSize: 12, marginBottom: 16 }}>{error}</Text>
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
