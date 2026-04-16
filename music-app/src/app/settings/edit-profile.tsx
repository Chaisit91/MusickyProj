import React, { useState } from "react";
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema, type EditProfileForm } from "../../schema/authSchema";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfileThunk } from "../../store/authSlice";
import { Image } from "expo-image";

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const CameraIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#fff"
      d="M12 15.2A3.2 3.2 0 1112 8.8a3.2 3.2 0 010 6.4zm0-8.4a5.2 5.2 0 100 10.4A5.2 5.2 0 0012 6.8zM9 3L7.17 5H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-3.17L15 3H9z"
    />
  </Svg>
);

const UserIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#888"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </Svg>
);

const EmailIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#888"
      d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
    />
  </Svg>
);

export default function EditProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const email = user?.email ?? "";

  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [pickedMimeType, setPickedMimeType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const nameValue = watch("name");
  const initial = (nameValue?.charAt(0) ?? "?").toUpperCase();
  const avatarSource = pickedUri ?? user?.avatarUrl;

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ไม่ได้รับอนุญาต", "แอปต้องการสิทธิ์เข้าถึงรูปภาพในเครื่อง");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPickedUri(asset.uri);
      setPickedMimeType(asset.mimeType ?? "image/jpeg");
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ไม่ได้รับอนุญาต", "แอปต้องการสิทธิ์เข้าถึงกล้อง");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPickedUri(asset.uri);
      setPickedMimeType(asset.mimeType ?? "image/jpeg");
    }
  };

  const handlePickImage = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["ยกเลิก", "เลือกจากคลังรูป", "ถ่ายรูป"],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) pickFromGallery();
          if (idx === 2) pickFromCamera();
        }
      );
    } else {
      Alert.alert("เปลี่ยนรูปโปรไฟล์", "เลือกแหล่งรูปภาพ", [
        { text: "ยกเลิก", style: "cancel" },
        { text: "เลือกจากคลังรูป", onPress: pickFromGallery },
        { text: "ถ่ายรูป", onPress: pickFromCamera },
      ]);
    }
  };

  const handleSave = handleSubmit(async (data) => {
    const nameChanged = data.name.trim() !== user?.name;
    const avatarChanged = !!pickedUri;
    if (!nameChanged && !avatarChanged) {
      router.back();
      return;
    }
    setLoading(true);
    const result = await dispatch(
      updateProfileThunk({
        name: nameChanged ? data.name.trim() : undefined,
        avatarUri: pickedUri ?? undefined,
        avatarMimeType: pickedMimeType,
      })
    );
    setLoading(false);
    if (updateProfileThunk.fulfilled.match(result)) {
      Alert.alert("สำเร็จ", "บันทึกโปรไฟล์เรียบร้อย", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("เกิดข้อผิดพลาด", String(result.payload ?? "บันทึกไม่สำเร็จ"));
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginRight: 16 }}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Edit Profile</Text>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginVertical: 24 }}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
            <View style={{ position: "relative" }}>
              {avatarSource ? (
                <Image
                  source={{ uri: avatarSource }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 3,
                    borderColor: "#2a2a2a",
                  }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: "#5b4fcf",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#2a2a2a",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 38, fontWeight: "700" }}>{initial}</Text>
                </View>
              )}

              {/* Camera button overlay */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#e84393",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#111",
                }}
              >
                <CameraIcon />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7} style={{ marginTop: 12 }}>
            <Text style={{ color: "#e84393", fontSize: 13, fontWeight: "600" }}>
              เปลี่ยนรูปโปรไฟล์
            </Text>
          </TouchableOpacity>

          {pickedUri && (
            <TouchableOpacity
              onPress={() => setPickedUri(null)}
              activeOpacity={0.7}
              style={{ marginTop: 4 }}
            >
              <Text style={{ color: "#666", fontSize: 12 }}>ยกเลิกการเลือก</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          {/* Name */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <UserIcon />
              <Text style={{ color: "#888", fontSize: 13 }}>ชื่อผู้ใช้</Text>
            </View>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={{
                    backgroundColor: "#1e1e1e",
                    borderRadius: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    color: "#fff",
                    fontSize: 15,
                    borderWidth: 1,
                    borderColor: errors.name ? "#ff4444" : "#2a2a2a",
                  }}
                  placeholderTextColor="#555"
                  placeholder="ชื่อของคุณ"
                />
              )}
            />
            {errors.name && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{errors.name.message}</Text>
            )}
          </View>

          {/* Email (read-only) */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <EmailIcon />
              <Text style={{ color: "#888", fontSize: 13 }}>อีเมล</Text>
            </View>
            <TextInput
              value={email}
              editable={false}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: "#555",
                fontSize: 15,
                borderWidth: 1,
                borderColor: "#222",
              }}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={loading}
            style={{
              marginTop: 8,
              borderRadius: 30,
              paddingVertical: 15,
              alignItems: "center",
              backgroundColor: "#e84393",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                บันทึกการเปลี่ยนแปลง
              </Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View
            style={{
              backgroundColor: "#1a2040",
              borderRadius: 10,
              padding: 14,
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Text style={{ color: "#6b84d4", fontSize: 13, lineHeight: 20, flex: 1 }}>
              ℹ️ รองรับรูปแบบ JPEG, PNG, WEBP ขนาดไม่เกิน 5MB การกดรูปโปรไฟล์จะเปิดตัวเลือกให้เลือกจากคลังรูปหรือถ่ายรูปใหม่
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
