// หน้าจัดการ queue — แสดง Now Playing + รายการเพลงทั้งหมด, reorder ด้วย up/down, ลบเพลงออกจาก queue, เลือก repeat mode (none/all/one) | auto-load เพลงสุ่มเมื่อ queue ว่าง
//
// หลักการทำงาน:
// 1. mount: ถ้า queue ว่าง → fetch /songs (สุ่ม 20 เพลง) → dispatch setQueue + playSong
// 2. แสดง Now Playing card + FlatList รายการเพลงที่เหลือใน queue
// 3. ปุ่มลูกศรขึ้น/ลง: dispatch moveQueueItem (เลื่อนเพลงใน queue)
// 4. กด เพลง: dispatch playSong เล่นทันที
// 5. กด trash: dispatch removeFromQueue ลบออกจาก queue
// 6. Repeat mode badge: cycleRepeat (none→all→one) แสดง icon ที่ด้านบน

import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  playSong, removeFromQueue, moveQueueItem,
  togglePlay, setQueue, setRepeatMode,
} from "../../store/playerSlice";
import { Song } from "../../api/homeApi";
import { colorFor } from "../../constants";
import apiClient from "../../api/apiClient";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDown = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path fill="#fff" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </Svg>
);

const ArrowUpIcon = ({ disabled }: { disabled?: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill={disabled ? "#2a2a2a" : "#555"} d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
  </Svg>
);

const ArrowDownIcon = ({ disabled }: { disabled?: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill={disabled ? "#2a2a2a" : "#555"} d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </Svg>
);

const EqualizerIcon = ({ active }: { active: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Rect x={2} y={active ? 10 : 6} width={4} height={active ? 14 : 18} rx={1} fill={active ? "#a78bfa" : "#555"} />
    <Rect x={10} y={active ? 4 : 8} width={4} height={active ? 20 : 16} rx={1} fill={active ? "#a78bfa" : "#555"} />
    <Rect x={18} y={active ? 8 : 4} width={4} height={active ? 16 : 20} rx={1} fill={active ? "#a78bfa" : "#555"} />
  </Svg>
);

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#fff" d="M8 5v14l11-7z" />
  </Svg>
);

const PauseIcon = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#555" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Svg>
);


const RepeatAllIcon = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill={active ? "#fff" : "#555"} d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
  </Svg>
);

const RepeatOneIcon = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill={active ? "#fff" : "#555"} d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const fetchRandomSongs = async (): Promise<Song[]> => {
  const { data } = await apiClient.get("/songs", { params: { limit: 500 } });
  const songs: Song[] = data.data ?? [];
  return shuffle(songs);
};

// ─── Queue Row ────────────────────────────────────────────────────────────────

const QueueRow = ({
  song, index, isActive, isDone,
  onPress, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown,
}: {
  song: Song; index: number; isActive: boolean; isDone: boolean;
  onPress: () => void; onRemove: () => void;
  onMoveUp?: () => void; onMoveDown?: () => void;
  canMoveUp?: boolean; canMoveDown?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{
      flexDirection: "row", alignItems: "center",
      paddingVertical: 10, paddingHorizontal: 20, gap: 12,
      backgroundColor: isActive ? "#1e1e1e" : "transparent",
      opacity: isDone ? 0.4 : 1,
    }}
  >
    {/* Move buttons — only for upcoming */}
    {!isActive && !isDone ? (
      <View style={{ width: 28, alignItems: "center" }}>
        <TouchableOpacity onPress={onMoveUp} disabled={!canMoveUp} activeOpacity={0.7}
          style={{ padding: 2 }} hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}>
          <ArrowUpIcon disabled={!canMoveUp} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMoveDown} disabled={!canMoveDown} activeOpacity={0.7}
          style={{ padding: 2 }} hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}>
          <ArrowDownIcon disabled={!canMoveDown} />
        </TouchableOpacity>
      </View>
    ) : (
      <View style={{ width: 28 }} />
    )}

    {/* Cover */}
    <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: colorFor(index) }}>
      {song.coverUrl
        ? <Image source={{ uri: song.coverUrl }} style={{ width: 44, height: 44 }} contentFit="cover" />
        : <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#ffffff60" }}>♪</Text>
          </View>
      }
    </View>

    {/* Info */}
    <View style={{ flex: 1 }}>
      <Text style={{ color: isActive ? "#fff" : isDone ? "#666" : "#ccc", fontSize: 14, fontWeight: isActive ? "700" : "400" }} numberOfLines={1}>
        {song.title}
      </Text>
      <Text style={{ color: "#444", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
        {song.artist?.name}{song.album?.title ? ` · ${song.album.title}` : ""}
      </Text>
    </View>

    <EqualizerIcon active={isActive} />

    {/* Remove — only for upcoming */}
    {!isActive && !isDone && (
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7} style={{ padding: 6 }}>
        <CloseIcon />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

// ─── QueueScreen ──────────────────────────────────────────────────────────────

export default function QueueScreen() {
  const dispatch = useAppDispatch();
  const { currentSong, queue, currentIndex, repeatMode, isPlaying } = useAppSelector((s) => s.player);
  const [, setLoadingRandom] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Auto-load random songs if queue is empty
  useEffect(() => {
    if (queue.length === 0) {
      loadRandom();
    }
  }, []);

  // Auto-scroll to current song
  useEffect(() => {
    if (queue.length > 0 && currentIndex >= 0) {
      setTimeout(() => listRef.current?.scrollToIndex({ index: currentIndex, animated: true, viewPosition: 0.3 }), 300);
    }
  }, [currentIndex]);

  const loadRandom = async () => {
    setLoadingRandom(true);
    try {
      const songs = await fetchRandomSongs();
      if (songs.length === 0) return;
      if (currentSong) {
        // append after current position
        const before = queue.slice(0, currentIndex + 1);
        const after = queue.slice(currentIndex + 1);
        dispatch(setQueue([...before, ...songs, ...after]));
      } else {
        dispatch(setQueue(songs));
        dispatch(playSong({ song: songs[0], queue: songs, index: 0 }));
      }
    } catch {}
    finally { setLoadingRandom(false); }
  };

  if (!currentSong) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  const upcomingQueue = queue.slice(currentIndex + 1);
  const playedQueue = queue.slice(0, currentIndex);
  const modeLabel = repeatMode === "one" ? "วนเพลงนี้" : repeatMode === "all" ? "คิวไหล" : "เล่นตามลำดับ";

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* ── Now Playing header ── */}
      <View style={{
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
        flexDirection: "row", alignItems: "center", gap: 14,
        borderBottomWidth: 1, borderBottomColor: "#1e1e1e",
      }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronDown />
        </TouchableOpacity>
        <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: "#1a1a3e" }}>
          {currentSong.coverUrl
            ? <Image source={{ uri: currentSong.coverUrl }} style={{ width: 44, height: 44 }} contentFit="cover" />
            : <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#ffffff30" }}>♪</Text>
              </View>
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#888", fontSize: 11, letterSpacing: 0.5 }}>Now Playing</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 }} numberOfLines={1}>
            "{currentSong.title}" — {currentSong.artist?.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => dispatch(togglePlay())}
          activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isPlaying ? "#7c3aed" : "#2a2a2a", alignItems: "center", justifyContent: "center" }}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </TouchableOpacity>
      </View>

      {/* ── Playback Mode Selector ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => dispatch(setRepeatMode("none"))} activeOpacity={0.7}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center", gap: 4,
              backgroundColor: repeatMode === "none" ? "#2a2a2a" : "#1a1a1a",
              borderWidth: 1, borderColor: repeatMode === "none" ? "#444" : "#1e1e1e" }}>
            <Text style={{ fontSize: 14 }}>▶</Text>
            <Text style={{ color: repeatMode === "none" ? "#fff" : "#444", fontSize: 10, fontWeight: "600" }}>ตามลำดับ</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => dispatch(setRepeatMode("all"))} activeOpacity={0.7}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center", gap: 4,
              backgroundColor: repeatMode === "all" ? "#2a2a2a" : "#1a1a1a",
              borderWidth: 1, borderColor: repeatMode === "all" ? "#444" : "#1e1e1e" }}>
            <RepeatAllIcon active={repeatMode === "all"} />
            <Text style={{ color: repeatMode === "all" ? "#fff" : "#444", fontSize: 10, fontWeight: "600" }}>คิวไหล</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => dispatch(setRepeatMode("one"))} activeOpacity={0.7}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center", gap: 4,
              backgroundColor: repeatMode === "one" ? "#2a2a2a" : "#1a1a1a",
              borderWidth: 1, borderColor: repeatMode === "one" ? "#444" : "#1e1e1e" }}>
            <RepeatOneIcon active={repeatMode === "one"} />
            <Text style={{ color: repeatMode === "one" ? "#fff" : "#444", fontSize: 10, fontWeight: "600" }}>วนเพลงนี้</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Queue header ── */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>In Queue</Text>
        <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }}>
          {modeLabel} · {upcomingQueue.length} เพลงถัดไป
        </Text>
      </View>

      {/* ── Full queue list ── */}
      <FlatList
        ref={listRef}
        data={queue}
        keyExtractor={(s, i) => `${s.id}-${i}`}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item: song, index }) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          const upcomingIdx = index - currentIndex - 1;
          const upcomingCount = queue.length - currentIndex - 1;
          return (
            <QueueRow
              song={song}
              index={index}
              isActive={isActive}
              isDone={isDone}
              onPress={() => {
                if (!isActive) dispatch(playSong({ song, queue, index }));
              }}
              onRemove={() => dispatch(removeFromQueue(index))}
              canMoveUp={upcomingIdx > 0}
              canMoveDown={upcomingIdx < upcomingCount - 1}
              onMoveUp={() => dispatch(moveQueueItem({ from: index, to: index - 1 }))}
              onMoveDown={() => dispatch(moveQueueItem({ from: index, to: index + 1 }))}
            />
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <ActivityIndicator color="#7c3aed" />
            <Text style={{ color: "#555", fontSize: 13, marginTop: 12 }}>กำลังโหลดเพลง...</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
