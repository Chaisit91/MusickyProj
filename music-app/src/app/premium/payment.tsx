// หน้าชำระเงิน Premium — กรอกข้อมูล, เลือกแพ็กเกจ, ยืนยันการสมัคร | dispatch paymentThunk

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path, Rect } from "react-native-svg";
import { useAppDispatch } from "../../store/hooks";
import { fetchMeThunk } from "../../store/authSlice";
import { fetchNotifications } from "../../store/notificationsSlice";
import { submitPaymentApi } from "../../api/paymentApi";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const QRIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#7c3aed" d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-2 4h2v2h-2zm2 2h2v2h-2zm2-4h2v2h-2zm-4 4h2v2h-2z" />
  </Svg>
);

const BankIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#7c3aed" d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zm-8 9h19v-3H2v3zM20 10v7h3v-7h-3zM11.5 1L2 6v2h19V6l-9.5-5z" />
  </Svg>
);

const ShieldIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#16a34a" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#7c3aed" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </Svg>
);

// ─── QR Placeholder ───────────────────────────────────────────────────────────

const QRCodePlaceholder = () => (
  <Svg width={180} height={180} viewBox="0 0 180 180">
    <Rect x={0} y={0} width={180} height={180} rx={12} fill="#1e1e1e" />
    <Rect x={10} y={10} width={50} height={50} rx={4} fill="none" stroke="#7c3aed" strokeWidth={4} />
    <Rect x={20} y={20} width={30} height={30} rx={2} fill="#7c3aed" />
    <Rect x={120} y={10} width={50} height={50} rx={4} fill="none" stroke="#7c3aed" strokeWidth={4} />
    <Rect x={130} y={20} width={30} height={30} rx={2} fill="#7c3aed" />
    <Rect x={10} y={120} width={50} height={50} rx={4} fill="none" stroke="#7c3aed" strokeWidth={4} />
    <Rect x={20} y={130} width={30} height={30} rx={2} fill="#7c3aed" />
    {[
      [70,10],[80,10],[90,10],[100,10],[110,10],
      [70,20],[100,20],[110,20],[80,30],[90,30],
      [70,40],[80,40],[100,40],[70,50],[90,50],[110,50],
      [70,70],[80,70],[90,70],[110,70],[80,80],[100,80],
      [70,90],[90,90],[110,90],[80,100],[90,100],[110,100],
      [70,110],[80,110],[100,110],[70,120],[90,120],[110,120],
      [110,130],[110,140],[110,150],[110,160],[110,170],
      [70,130],[80,130],[70,140],[80,140],[90,140],
      [70,150],[90,150],[70,160],[80,160],[100,160],
      [70,170],[90,170],[100,170],
    ].map(([x, y], i) => (
      <Rect key={i} x={x} y={y} width={8} height={8} rx={1} fill="#a78bfa" />
    ))}
    <Rect x={75} y={75} width={30} height={30} rx={4} fill="#111" />
    <Path d="M85 85 L95 90 L85 95 Z" fill="#7c3aed" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type PayMethod = "QR_CODE" | "BANK_TRANSFER";

interface SlipAsset {
  uri: string;
  mimeType: string;
  name: string;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const PRICE = "฿149.00";
const BANK_ACCOUNT = "123-4-56789-8";
const BANK_NAME = "ธนาคารกสิกรไทย";
const ACCOUNT_NAME = "บริษัท มิวสิคกี้ จำกัด";

export default function PaymentScreen() {
  const dispatch = useAppDispatch();
  const [method, setMethod] = useState<PayMethod>("QR_CODE");
  const [accountName, setAccountName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [slip, setSlip] = useState<SlipAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickSlip = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตการเข้าถึงรูปภาพ");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSlip({
        uri: asset.uri,
        mimeType: asset.mimeType ?? "image/jpeg",
        name: asset.fileName ?? "slip.jpg",
      });
    }
  };

  const handleConfirm = async () => {
    if (method === "BANK_TRANSFER") {
      if (!accountName.trim()) {
        Alert.alert("กรุณากรอกชื่อบัญชี");
        return;
      }
      if (!accountNo.trim()) {
        Alert.alert("กรุณากรอกเลขบัญชี");
        return;
      }
      if (!slip) {
        Alert.alert("กรุณาแนบสลิป", "กรุณาอัปโหลดสลิปการโอนเงิน");
        return;
      }
    }

    setLoading(true);
    try {
      await submitPaymentApi({
        method,
        accountName: accountName || undefined,
        accountNo: accountNo || undefined,
        slipUri: slip?.uri,
        slipMimeType: slip?.mimeType,
      });

      // รีเฟรช user data เพื่ออัปเดต isPremium
      await dispatch(fetchMeThunk());
      // รีเฟรช notifications
      dispatch(fetchNotifications());

      router.replace("/premium/success");
    } catch (err: any) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message ?? "ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyAccount = () => {
    Alert.alert("คัดลอกแล้ว", `เลขบัญชี ${BANK_ACCOUNT} ถูกคัดลอกแล้ว`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 16,
            gap: 14,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>ชำระเงิน</Text>
            <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>Premium รายเดือน</Text>
          </View>
        </View>

        {/* ── Amount ── */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "#1a0a3b",
            borderRadius: 16,
            padding: 20,
            alignItems: "center",
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#2d1b69",
          }}
        >
          <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "600" }}>ยอดชำระ</Text>
          <Text style={{ color: "#fff", fontSize: 40, fontWeight: "800", marginTop: 4 }}>{PRICE}</Text>
          <Text style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Premium รายเดือน • ต่ออายุอัตโนมัติ</Text>
        </View>

        {/* ── Method selector ── */}
        <Text style={{ color: "#888", fontSize: 13, fontWeight: "600", paddingHorizontal: 20, marginBottom: 10 }}>
          เลือกวิธีชำระเงิน
        </Text>
        <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 20 }}>
          {([
            { key: "QR_CODE" as const, label: "QR Code", icon: <QRIcon /> },
            { key: "BANK_TRANSFER" as const, label: "โอนเงิน", icon: <BankIcon /> },
          ]).map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setMethod(m.key)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: method === m.key ? "#2d1b69" : "#1e1e1e",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                gap: 8,
                borderWidth: method === m.key ? 1.5 : 0,
                borderColor: method === m.key ? "#7c3aed" : "transparent",
              }}
            >
              {m.icon}
              <Text style={{ color: method === m.key ? "#fff" : "#888", fontSize: 13, fontWeight: "600" }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── QR Method ── */}
        {method === "QR_CODE" && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ backgroundColor: "#161616", borderRadius: 16, padding: 24, alignItems: "center", gap: 16 }}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>สแกน QR Code เพื่อชำระเงิน</Text>
              <QRCodePlaceholder />
              <Text style={{ color: "#888", fontSize: 12, textAlign: "center" }}>
                สแกน QR Code ด้านบนผ่านแอปธนาคาร{"\n"}หรือ PromptPay เพื่อชำระเงิน {PRICE}
              </Text>
              <View style={{ width: "100%", height: 1, backgroundColor: "#2a2a2a" }} />
              <Text style={{ color: "#666", fontSize: 12, textAlign: "center" }}>QR Code นี้ใช้ได้ภายใน 15 นาที</Text>
            </View>

            <View style={{ backgroundColor: "#161616", borderRadius: 14, padding: 16, marginTop: 14 }}>
              <Text style={{ color: "#fff", fontWeight: "700", marginBottom: 12 }}>วิธีการชำระเงิน</Text>
              {[
                "เปิดแอปธนาคารหรือ PromptPay",
                "กดสแกน QR Code",
                "ตรวจสอบยอดเงิน แล้วยืนยัน",
                'กลับมากด "ยืนยันการชำระเงิน"',
              ].map((step, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{i + 1}</Text>
                  </View>
                  <Text style={{ color: "#aaa", fontSize: 13, flex: 1, lineHeight: 20 }}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Bank Transfer Method ── */}
        {method === "BANK_TRANSFER" && (
          <View style={{ paddingHorizontal: 16 }}>
            {/* Account info */}
            <View style={{ backgroundColor: "#161616", borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <Text style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>โอนเงินไปที่บัญชีนี้</Text>
              <View style={{ gap: 10 }}>
                {[
                  { label: "ธนาคาร", value: BANK_NAME },
                  { label: "ชื่อบัญชี", value: ACCOUNT_NAME },
                ].map((row) => (
                  <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#888", fontSize: 13 }}>{row.label}</Text>
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{row.value}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#888", fontSize: 13 }}>เลขบัญชี</Text>
                  <TouchableOpacity onPress={copyAccount} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: "#7c3aed", fontSize: 15, fontWeight: "700" }}>{BANK_ACCOUNT}</Text>
                    <CopyIcon />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#888", fontSize: 13 }}>จำนวนเงิน</Text>
                  <Text style={{ color: "#FFD700", fontSize: 15, fontWeight: "700" }}>{PRICE}</Text>
                </View>
              </View>
            </View>

            {/* Form */}
            <View style={{ gap: 12, marginBottom: 14 }}>
              <View>
                <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>ชื่อบัญชีที่โอน *</Text>
                <TextInput
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="ชื่อ-นามสกุล"
                  placeholderTextColor="#444"
                  style={{ backgroundColor: "#1e1e1e", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, color: "#fff", fontSize: 14 }}
                />
              </View>
              <View>
                <Text style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>เลขบัญชีที่โอน *</Text>
                <TextInput
                  value={accountNo}
                  onChangeText={setAccountNo}
                  placeholder="123-4-56789-8"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  style={{ backgroundColor: "#1e1e1e", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, color: "#fff", fontSize: 14 }}
                />
              </View>
            </View>

            {/* Slip upload */}
            <TouchableOpacity
              onPress={pickSlip}
              activeOpacity={0.8}
              style={{
                backgroundColor: slip ? "#052e16" : "#1e1e1e",
                borderRadius: 14,
                padding: 20,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: slip ? "#16a34a" : "#2a2a2a",
                borderStyle: "dashed",
                marginBottom: 14,
                gap: 8,
              }}
            >
              {slip ? (
                <>
                  <Text style={{ fontSize: 28 }}>✅</Text>
                  <Text style={{ color: "#16a34a", fontSize: 14, fontWeight: "600" }}>อัปโหลดสลิปแล้ว</Text>
                  <Text style={{ color: "#555", fontSize: 12 }}>{slip.name} • กดเพื่อเปลี่ยน</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 28 }}>📎</Text>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>อัปโหลดสลิปการโอน</Text>
                  <Text style={{ color: "#555", fontSize: 12 }}>JPG, PNG • ขนาดไม่เกิน 5 MB</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Warning */}
            <View style={{ backgroundColor: "#1a1200", borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: "#d97706", marginBottom: 4 }}>
              <Text style={{ color: "#d97706", fontSize: 12, lineHeight: 18 }}>
                ⚠️ กรุณาโอนยอดเงินให้ตรงตามจำนวน ({PRICE}) และแนบสลิปให้ครบถ้วน{"\n"}การตรวจสอบใช้เวลาประมาณ 5–30 นาที
              </Text>
            </View>
          </View>
        )}

        {/* ── Confirm Button ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#4c1d95" : "#7c3aed",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>กำลังดำเนินการ...</Text>
              </>
            ) : (
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>ยืนยันการชำระเงิน</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
            <ShieldIcon />
            <Text style={{ color: "#555", fontSize: 12 }}>การชำระเงินปลอดภัยและเข้ารหัส</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
