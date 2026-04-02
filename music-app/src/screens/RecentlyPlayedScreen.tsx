import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { getAllPlayHistory, recordPlay, deleteHistoryRecord, deleteAllHistory, PlayHistoryItem } from "../api/homeApi";

const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#ffffff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill="#ff4444"
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
    />
  </Svg>
);

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
};

export default function RecentlyPlayedScreen() {
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getAllPlayHistory();
      setHistory(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = async (item: PlayHistoryItem) => {
    try {
      await recordPlay(item.song.id);
      const updated = await getAllPlayHistory();
      setHistory(updated);
    } catch {
      // silent
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "ลบทั้งหมด",
      "ต้องการลบประวัติการเล่นทั้งหมด?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบทั้งหมด",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllHistory();
              setHistory([]);
            } catch {
              Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบได้ ลองใหม่อีกครั้ง");
            }
          },
        },
      ]
    );
  };

  const handleDelete = (item: PlayHistoryItem) => {
    Alert.alert(
      "ลบประวัติ",
      `ต้องการลบ "${item.song.title}" ออกจากประวัติ?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await deleteHistoryRecord(item.id);
              setHistory((prev) => prev.filter((h) => h.id !== item.id));
            } catch {
              Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบได้ ลองใหม่อีกครั้ง");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: PlayHistoryItem; index: number }) => {
    const color = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    const isDeleting = deletingId === item.id;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 14,
          opacity: isDeleting ? 0.4 : 1,
        }}
      >
        {/* Thumbnail */}
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 8,
            backgroundColor: color,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {item.song.coverUrl ? (
            <Image
              source={{ uri: item.song.coverUrl }}
              style={{ width: 54, height: 54 }}
              resizeMode="cover"
            />
          ) : (
            <Text
              style={{ color: "#fff", fontSize: 9, fontWeight: "700", textAlign: "center", paddingHorizontal: 4 }}
              numberOfLines={2}
            >
              {item.song.album.title}
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
            {item.song.title}
          </Text>
          <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {item.song.artist.name} · {item.song.genre.name}
          </Text>
        </View>

        {/* Time + Delete */}
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <Text style={{ color: "#555", fontSize: 11 }}>{formatTime(item.playedAt)}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={isDeleting}
          >
            <TrashIcon />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 52,
          paddingBottom: 16,
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ padding: 4 }}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Recently Played</Text>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleDeleteAll}
            activeOpacity={0.7}
            style={{ marginLeft: "auto" }}
          >
            <Text style={{ color: "#ff4444", fontSize: 13 }}>ลบทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#1e1e1e" }} />

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#555", fontSize: 15 }}>ยังไม่มีประวัติการเล่น</Text>
          <Text style={{ color: "#444", fontSize: 13, marginTop: 8 }}>กดเพลงใดก็ได้เพื่อเริ่มต้น</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#1a1a1a", marginLeft: 88 }} />
          )}
        />
      )}
    </View>
  );
}
