// หน้าการแจ้งเตือน — แสดงรายการ notifications ทั้งหมด, mark all read, ลบแต่ละรายการ | badge unread count จาก Redux

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../store/notificationsSlice";
import { AppNotification } from "../../api/notificationsApi";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const PaymentIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#7c3aed" d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </Svg>
);

const SuccessIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#16a34a" />
    <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

const PendingIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#d97706" />
    <Path fill="#fff" d="M12 7v5l4 2-1 1.73-5-2.73V7z" />
  </Svg>
);

const FailIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#dc2626" />
    <Path fill="#fff" stroke="#fff" strokeWidth={2} strokeLinecap="round" d="M8 8l8 8M16 8l-8 8" />
  </Svg>
);

const PremiumIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#FFD700" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2 3h10v2H7v-2z" />
  </Svg>
);

const SupportIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#7c3aed" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </Svg>
);

const BellOffIcon = () => (
  <Svg width={56} height={56} viewBox="0 0 24 24">
    <Path fill="#2a2a2a" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

type NotifType = AppNotification["type"];
type FilterTab = "ทั้งหมด" | "การชำระเงิน" | "Premium" | "Support";

const bgColor: Record<NotifType, string> = {
  PAYMENT_SUCCESS: "#052e16",
  PAYMENT_PENDING: "#451a03",
  PAYMENT_FAILED: "#3b0000",
  PREMIUM_ACTIVATED: "#1e1b4b",
  PREMIUM_EXPIRING: "#1a1a00",
  SUPPORT_REPLY: "#1e1b4b",
};

const accentColor: Record<NotifType, string> = {
  PAYMENT_SUCCESS: "#16a34a",
  PAYMENT_PENDING: "#d97706",
  PAYMENT_FAILED: "#dc2626",
  PREMIUM_ACTIVATED: "#7c3aed",
  PREMIUM_EXPIRING: "#ca8a04",
  SUPPORT_REPLY: "#7c3aed",
};

const NotifIconComp = ({ type }: { type: NotifType }) => {
  if (type === "PAYMENT_SUCCESS") return <SuccessIcon />;
  if (type === "PAYMENT_PENDING") return <PendingIcon />;
  if (type === "PAYMENT_FAILED") return <FailIcon />;
  if (type === "SUPPORT_REPLY") return <SupportIcon />;
  return <PremiumIcon />;
};

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
                           "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

// parse ทั้ง ISO string และ "DD/MM/YYYY HH:MM:SS" (Thai BE format จาก backend)
const parseDate = (str: string): Date => {
  const iso = new Date(str);
  if (!isNaN(iso.getTime())) return iso;
  // split "14/04/2569 03:24:34" → ["14","04","2569","03","24","34"]
  const parts = str.split(/[\/\s:]/).filter(Boolean);
  if (parts.length === 6) {
    const d = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10);
    const yBE = parseInt(parts[2], 10);
    const h = parseInt(parts[3], 10);
    const mi = parseInt(parts[4], 10);
    const s = parseInt(parts[5], 10);
    return new Date(yBE - 543, mo - 1, d, h, mi, s);
  }
  return new Date(NaN);
};

const formatTime = (str: string) => {
  const date = parseDate(str);
  if (isNaN(date.getTime())) return "-";
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "เมื่อกี้";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} วันที่แล้ว`;
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear() + 543}`;
};

// ─── Notification Card ────────────────────────────────────────────────────────

const NotificationCard = ({
  notif,
  onPress,
}: {
  notif: AppNotification;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      backgroundColor: notif.isRead ? "#161616" : bgColor[notif.type],
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      gap: 14,
      borderLeftWidth: notif.isRead ? 0 : 3,
      borderLeftColor: accentColor[notif.type],
    }}
  >
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1e1e1e",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <NotifIconComp type={notif.type} />
    </View>

    <View style={{ flex: 1 }}>
      {notif.type === "SUPPORT_REPLY" && (
        <View style={{ alignSelf: "flex-start", backgroundColor: "#7c3aed", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>ตอบกลับจาก ADMIN</Text>
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: notif.isRead ? "500" : "700", flex: 1, marginRight: 8 }}>
          {notif.title}
        </Text>
        {!notif.isRead && (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor[notif.type] }} />
        )}
      </View>
      <Text style={{ color: "#aaa", fontSize: 13, lineHeight: 18 }}>{notif.body}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Text style={{ color: "#555", fontSize: 12 }}>{formatTime(notif.createdAt)}</Text>
        {notif.amount && (
          <Text style={{ color: accentColor[notif.type], fontSize: 13, fontWeight: "700" }}>
            {notif.amount}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const FILTERS: FilterTab[] = ["ทั้งหมด", "การชำระเงิน", "Premium", "Support"];

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.notifications);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ทั้งหมด");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  };

  const handleMarkRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  const filtered = items.filter((n) => {
    if (activeFilter === "การชำระเงิน")
      return n.type === "PAYMENT_SUCCESS" || n.type === "PAYMENT_PENDING" || n.type === "PAYMENT_FAILED";
    if (activeFilter === "Premium")
      return n.type === "PREMIUM_ACTIVATED" || n.type === "PREMIUM_EXPIRING";
    if (activeFilter === "Support")
      return n.type === "SUPPORT_REPLY";
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <BackIcon />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>การแจ้งเตือน</Text>
              {unreadCount > 0 && (
                <View
                  style={{
                    backgroundColor: "#7c3aed",
                    borderRadius: 10,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    minWidth: 20,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
              <Text style={{ color: "#7c3aed", fontSize: 13, fontWeight: "600" }}>อ่านทั้งหมด</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          {FILTERS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
              style={{
                backgroundColor: activeFilter === tab ? "#7c3aed" : "#1e1e1e",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: activeFilter === tab ? "#fff" : "#888",
                  fontSize: 13,
                  fontWeight: activeFilter === tab ? "700" : "400",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── List ── */}
      {isLoading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 80, gap: 16 }}>
              <BellOffIcon />
              <Text style={{ color: "#555", fontSize: 15 }}>ไม่มีการแจ้งเตือน</Text>
            </View>
          ) : (
            filtered.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onPress={() => {
                  handleMarkRead(notif.id);
                  if (notif.type === "SUPPORT_REPLY") {
                    router.push("/settings/help-support");
                  }
                }}
              />
            ))
          )}

          {/* Info box */}
          {items.length > 0 && (
            <View
              style={{
                backgroundColor: "#161616",
                borderRadius: 12,
                padding: 14,
                marginTop: 8,
                flexDirection: "row",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <PaymentIcon />
              <Text style={{ color: "#666", fontSize: 12, lineHeight: 18, flex: 1 }}>
                การยืนยันการชำระเงินอาจใช้เวลา 5–30 นาที หากไม่ได้รับการยืนยันภายใน 1 ชั่วโมง กรุณาติดต่อทีม Support
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
