import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchMeThunk } from "../../store/authSlice";
import { cancelPremiumApi } from "../../api/paymentApi";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const CheckIcon = ({ color = "#7c3aed" }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill={color} d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

const CrossIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#555" d="M18 6L6 18M6 6l12 12" stroke="#555" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const CrownIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#FFD700" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2 3h10v2H7v-2z" />
  </Svg>
);

const MusicIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#7c3aed" d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
  </Svg>
);

// ─── Features Data ────────────────────────────────────────────────────────────

interface Feature {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: Feature[] = [
  { label: "ฟังเพลงออนไลน์", free: true, premium: true },
  { label: "โฆษณาระหว่างเพลง", free: true, premium: false },
  { label: "คุณภาพเสียงสูงสุด (HD)", free: false, premium: true },
  { label: "ดาวน์โหลดฟังออฟไลน์", free: false, premium: true },
  { label: "สตรีมคุณภาพ 320 kbps", free: false, premium: true },
  { label: "ข้ามเพลงได้ไม่จำกัด", free: false, premium: true },
  { label: "เล่นแบบ Shuffle", free: true, premium: true },
  { label: "ดูเนื้อเพลงแบบ Real-time", free: false, premium: true },
];

// ─── Plan Card ────────────────────────────────────────────────────────────────

const PlanCard = ({
  type,
  price,
  period,
  features,
  isPopular,
  isActive,
  onPress,
}: {
  type: "Free" | "Premium";
  price: string;
  period: string;
  features: Feature[];
  isPopular?: boolean;
  isActive?: boolean;
  onPress?: () => void;
}) => {
  const isPremium = type === "Premium";

  return (
    <View
      style={{
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: isPremium ? 1.5 : 1,
        borderColor: isPremium ? "#7c3aed" : "#2a2a2a",
        backgroundColor: isPremium ? "#1a0a3b" : "#161616",
      }}
    >
      {isPopular && (
        <View style={{ backgroundColor: "#7c3aed", alignItems: "center", paddingVertical: 6 }}>
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 1 }}>
            ยอดนิยม
          </Text>
        </View>
      )}

      <View style={{ padding: 20 }}>
        {/* Plan header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {isPremium ? <CrownIcon size={24} /> : <MusicIcon />}
          <View>
            <Text style={{ color: isPremium ? "#FFD700" : "#888", fontSize: 13, fontWeight: "600" }}>
              {type}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>{price}</Text>
              <Text style={{ color: "#888", fontSize: 13 }}>/{period}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={{ gap: 10, marginBottom: isPremium ? 20 : 0 }}>
          {features.map((f) => {
            const has = isPremium ? f.premium : f.free;
            return (
              <View key={f.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {has ? <CheckIcon color={isPremium ? "#a78bfa" : "#555"} /> : <CrossIcon />}
                <Text
                  style={{
                    color: has ? (isPremium ? "#ddd" : "#666") : "#444",
                    fontSize: 14,
                    textDecorationLine: (!has) ? "line-through" : "none",
                  }}
                >
                  {f.label}
                  {!has && f.label === "โฆษณาระหว่างเพลง" && isPremium
                    ? " (ไม่มี)"
                    : ""}
                </Text>
              </View>
            );
          })}
        </View>

        {isPremium && (
          isActive ? (
            <View
              style={{
                backgroundColor: "#16a34a22",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#16a34a",
              }}
            >
              <Text style={{ color: "#16a34a", fontSize: 15, fontWeight: "700" }}>
                ✓ ใช้งานอยู่แล้ว
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#7c3aed",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                สมัคร Premium Now!
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PremiumScreen() {
  const dispatch = useAppDispatch();
  const userIsPremium = useAppSelector((s) => s.auth.user?.isPremium ?? false);
  const premiumExpiresAt = useAppSelector((s) => s.auth.user?.premiumExpiresAt ?? null);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    subscribedAt: string | null;
    premiumExpiresAt: string;
  } | null>(null);

  const expiryText = premiumExpiresAt
    ? new Date(premiumExpiresAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }) : "-";

  const handleCancel = async () => {
    setCancelLoading(true);
    const result = await cancelPremiumApi();
    setCancelLoading(false);
    if (result.success) {
      await dispatch(fetchMeThunk());
    } else if (result.data.premiumExpiresAt) {
      setInfoModal({ subscribedAt: result.data.subscribedAt, premiumExpiresAt: result.data.premiumExpiresAt });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Info Modal (ยังอยู่ในรอบบิล) ── */}
      <Modal visible={!!infoModal} transparent animationType="fade" onRequestClose={() => setInfoModal(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: "#1a1a1a", borderRadius: 20, padding: 24, width: "100%", borderWidth: 1, borderColor: "#7c3aed33" }}>
            <Text style={{ color: "#FFD700", fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 16 }}>
              ไม่สามารถยกเลิกได้ตอนนี้
            </Text>
            <View style={{ backgroundColor: "#161616", borderRadius: 12, padding: 16, gap: 10, marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#888", fontSize: 13 }}>วันที่สมัคร</Text>
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{fmt(infoModal?.subscribedAt ?? null)}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: "#2a2a2a" }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#888", fontSize: 13 }}>ครบรอบบิล</Text>
                <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "600" }}>{fmt(infoModal?.premiumExpiresAt ?? null)}</Text>
              </View>
            </View>
            <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 20 }}>
              คุณสามารถยกเลิก Premium ได้หลังจากวันครบรอบบิล{"\n"}โดยยังใช้งาน Premium ได้จนถึงวันนั้น
            </Text>
            <TouchableOpacity
              onPress={() => setInfoModal(null)}
              activeOpacity={0.85}
              style={{ backgroundColor: "#7c3aed", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>รับทราบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Hero Banner ── */}
        <View
          style={{
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 32,
            alignItems: "center",
            backgroundColor: "#0d0020",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{ alignSelf: "flex-start", marginBottom: 20 }}
          >
            <BackIcon />
          </TouchableOpacity>

          <CrownIcon size={56} />
          <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "700", marginTop: 12, letterSpacing: 2 }}>
            MUSICKY PREMIUM
          </Text>
          {userIsPremium ? (
            <>
              <View style={{ backgroundColor: "#16a34a", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12 }}>
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✓ คุณเป็นสมาชิก Premium แล้ว</Text>
              </View>
              {expiryText && (
                <Text style={{ color: "#888", fontSize: 13, marginTop: 6, textAlign: "center" }}>
                  ใช้งานได้ถึง {expiryText}
                </Text>
              )}
              <Text style={{ color: "#888", fontSize: 13, marginTop: 4, textAlign: "center" }}>
                ขอบคุณที่เลือกใช้ Musicky Premium
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={cancelLoading}
                activeOpacity={0.7}
                style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#ffffff30", flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                {cancelLoading
                  ? <ActivityIndicator size={14} color="#888" />
                  : <Text style={{ color: "#888", fontSize: 13 }}>ยกเลิก Premium</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 8, textAlign: "center" }}>
                เพลิดเพลินกับเพลง{"\n"}ไม่มีขีดจำกัด
              </Text>
              <Text style={{ color: "#888", fontSize: 14, marginTop: 10, textAlign: "center", lineHeight: 20 }}>
                คุณภาพเสียงสูงสุด ดาวน์โหลดออฟไลน์{"\n"}และอีกมากมาย — เพียง ฿149/เดือน
              </Text>
            </>
          )}
        </View>

        {/* ── Plans ── */}
        <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 24 }}>
          <PlanCard
            type="Premium"
            price="฿149"
            period="เดือน"
            features={FEATURES}
            isPopular
            isActive={userIsPremium}
            onPress={() => router.push("/premium/payment")}
          />
          <PlanCard
            type="Free"
            price="฿0"
            period="เดือน"
            features={FEATURES}
          />
        </View>

        {/* ── FAQ ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 14 }}>
            คำถามที่พบบ่อย
          </Text>
          {[
            {
              q: "สมัครแล้วใช้ได้เลยไหม?",
              a: "หลังยืนยันการชำระเงินแล้ว (ประมาณ 5–30 นาที) ระบบจะอัปเกรดบัญชีของคุณทันที",
            },
            {
              q: "ยกเลิกได้ไหม?",
              a: "ได้ สามารถยกเลิกได้ทุกเมื่อ และยังใช้งาน Premium ได้จนครบรอบบิล",
            },
            {
              q: "ชำระด้วยวิธีอะไรได้บ้าง?",
              a: "รองรับ QR Code PromptPay และโอนเงินผ่านธนาคาร",
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor: "#161616",
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 6 }}>
                {item.q}
              </Text>
              <Text style={{ color: "#888", fontSize: 13, lineHeight: 18 }}>{item.a}</Text>
            </View>
          ))}
        </View>

        {/* ── CTA bottom ── */}
        {!userIsPremium && (
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => router.push("/premium/payment")}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#7c3aed",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>เริ่มต้นใช้ Premium</Text>
              <Text style={{ color: "#c4b5fd", fontSize: 12, marginTop: 3 }}>เพียง ฿149/เดือน • ยกเลิกได้ทุกเมื่อ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
