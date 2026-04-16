import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { helpSupportSchema, type HelpSupportForm } from "../../schema/authSchema";

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

const ISSUE_TYPES = [
  { label: "เพลงไม่เล่นได้", sublabel: "ปัญหาการเล่นเพลง" },
  { label: "เข้าสู่ระบบไม่ได้", sublabel: "ปัญหาบัญชี" },
  { label: "แอปทำงานผิดปกติ", sublabel: "ข้อผิดพลาดในแอป" },
  { label: "ปัญหาการชำระเงิน Premium", sublabel: "ชำระเงิน / Premium" },
  { label: "ปัญหาการดาวน์โหลด", sublabel: "การดาวน์โหลด" },
  { label: "ต้องการคำแนะนำ", sublabel: "ทั่วไป" },
  { label: "ปัญหาอื่นๆ", sublabel: "อื่นๆ" },
];

export default function HelpSupportScreen() {
  const [selectedType, setSelectedType] = useState(ISSUE_TYPES[0].label);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<HelpSupportForm>({
    resolver: zodResolver(helpSupportSchema),
    defaultValues: { description: "", contactEmail: "" },
  });

  const description = useWatch({ control, name: "description" });
  const descLen = description?.length ?? 0;

  const handleSend = handleSubmit(async (data) => {
    setLoading(true);
    const subject = encodeURIComponent(`[Musicky] ${selectedType}`);
    const body = encodeURIComponent(
      `ประเภทปัญหา: ${selectedType}\n\nรายละเอียด:\n${data.description}\n\nอีเมลติดต่อกลับ: ${data.contactEmail}`
    );
    const mailUrl = `mailto:support@musicky.com?subject=${subject}&body=${body}`;
    const canOpen = await Linking.canOpenURL(mailUrl);
    setLoading(false);
    if (canOpen) {
      await Linking.openURL(mailUrl);
    } else {
      Alert.alert("ไม่พบแอปอีเมล", "กรุณาติดต่อเราที่ support@musicky.com โดยตรง");
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
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginRight: 16 }}>
            <BackIcon />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>ร้องเรียน / พบปัญหา</Text>
            <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>แจ้งปัญหาให้กับเราทราบ</Text>
          </View>
        </View>

        {/* Info box */}
        <View
          style={{
            backgroundColor: "#1a2040",
            marginHorizontal: 16,
            marginVertical: 16,
            borderRadius: 12,
            padding: 14,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>ℹ️</Text>
          <Text style={{ color: "#6b84d4", fontSize: 13, flex: 1, lineHeight: 20 }}>
            ทีมงานของเรายินดีช่วยเหลือคุณ กรุณาอธิบายปัญหาที่พบอย่างละเอียดเพื่อให้เราสามารถช่วยได้ดีที่สุด
          </Text>
        </View>

        {/* Issue Type */}
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", paddingHorizontal: 20, marginBottom: 10 }}>
          ประเภทปัญหา
        </Text>
        <View style={{ paddingHorizontal: 16, gap: 8, marginBottom: 20 }}>
          {ISSUE_TYPES.map((item) => {
            const isSelected = selectedType === item.label;
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => setSelectedType(item.label)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isSelected ? "#3b1f6e" : "#1e1e1e",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: isSelected ? 1.5 : 0,
                  borderColor: isSelected ? "#7c3aed" : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{item.label}</Text>
                  <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{item.sublabel}</Text>
                </View>
                {isSelected && <CheckIcon />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
              รายละเอียดปัญหา <Text style={{ color: "#ff4444" }}>*</Text>
            </Text>
            <Text style={{ color: descLen > 900 ? "#ff4444" : "#555", fontSize: 12 }}>{descLen}/1000</Text>
          </View>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholder="กรุณาอธิบายปัญหาที่พบ วันเวลา อุปกรณ์ที่ใช้ และขั้นตอนที่เกิดปัญหา..."
                placeholderTextColor="#444"
                style={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 14,
                  minHeight: 120,
                  borderWidth: 1,
                  borderColor: errors.description ? "#ff4444" : "#2a2a2a",
                  lineHeight: 22,
                }}
              />
            )}
          />
          {errors.description && (
            <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{errors.description.message}</Text>
          )}
        </View>

        {/* Contact email */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 10 }}>
            อีเมลสำหรับติดต่อกลับ <Text style={{ color: "#ff4444" }}>*</Text>
          </Text>
          <Controller
            control={control}
            name="contactEmail"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your.email@example.com"
                placeholderTextColor="#444"
                style={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: errors.contactEmail ? "#ff4444" : "#2a2a2a",
                }}
              />
            )}
          />
          {errors.contactEmail && (
            <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{errors.contactEmail.message}</Text>
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={loading}
          style={{
            marginHorizontal: 16,
            borderRadius: 30,
            paddingVertical: 15,
            alignItems: "center",
            backgroundColor: "#e84393",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path fill="#fff" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </Svg>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>ส่งรายงาน</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Contact info */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>ช่องทางการติดต่อ</Text>
          {[
            "📧 Email: support@musicky.com",
            "💬 Line: @musicky-support",
            "📞 โทร: 02-xxx-xxx-x (จ.-ศ. 9:00-18:00 น.)",
          ].map((txt, i) => (
            <Text key={i} style={{ color: "#888", fontSize: 13, marginBottom: 6 }}>
              {txt}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
