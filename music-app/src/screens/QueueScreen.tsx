import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  playSong,
  removeFromQueue,
  togglePlay,
  addToQueue,
  setRepeatMode,
} from "../store/playerSlice";
import { Song } from "../api/homeApi";
import { searchAll } from "../api/searchApi";

const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDown = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path fill="#fff" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </Svg>
);

const DragIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#444" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </Svg>
);

const EqualizerIcon = ({ active }: { active: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Rect x={2} y={active ? 10 : 6} width={4} height={active ? 14 : 18} rx={1} fill={active ? "#fff" : "#555"} />
    <Rect x={10} y={active ? 4 : 8} width={4} height={active ? 20 : 16} rx={1} fill={active ? "#fff" : "#555"} />
    <Rect x={18} y={active ? 8 : 4} width={4} height={active ? 16 : 20} rx={1} fill={active ? "#fff" : "#555"} />
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

const PlusIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#fff" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#888" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#4ade80" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

// ─── Queue Row ────────────────────────────────────────────────────────────────

const QueueRow = ({
  song,
  index,
  isActive,
  onPress,
  onRemove,
}: {
  song: Song;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 20,
      gap: 12,
      backgroundColor: isActive ? "#1e1e1e" : "transparent",
    }}
  >
    <View style={{ padding: 4 }}>
      <DragIcon />
    </View>
    <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: colorFor(index) }}>
      {(song.coverUrl || song.album.coverUrl) ? (
        <Image source={{ uri: (song.coverUrl || song.album.coverUrl)! }} style={{ width: 44, height: 44 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ffffff60" }}>♪</Text>
        </View>
      )}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: isActive ? "#fff" : "#ccc", fontSize: 14, fontWeight: isActive ? "700" : "400" }} numberOfLines={1}>
        {song.title}
      </Text>
      <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
        {song.artist.name}{song.album.title ? ` · ${song.album.title}` : ""}
      </Text>
    </View>
    <View style={{ padding: 4 }}>
      <EqualizerIcon active={isActive} />
    </View>
    {!isActive && (
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7} style={{ padding: 6 }}>
        <CloseIcon />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

// ─── Add Songs Modal ──────────────────────────────────────────────────────────

const AddSongsModal = ({
  visible,
  onClose,
  queueIds,
}: {
  visible: boolean;
  onClose: () => void;
  queueIds: Set<string>;
}) => {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchAll(q);
      setResults(res.songs);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (song: Song) => {
    dispatch(addToQueue(song));
    setAdded((prev) => new Set([...prev, song.id]));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#111" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>เพิ่มเพลงในคิว</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: 4 }}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, backgroundColor: "#1e1e1e", borderRadius: 10, paddingHorizontal: 12, gap: 8 }}>
          <SearchIcon />
          <TextInput
            style={{ flex: 1, color: "#fff", fontSize: 14, paddingVertical: 10 }}
            placeholder="ค้นหาเพลง..."
            placeholderTextColor="#555"
            value={query}
            onChangeText={(t) => { setQuery(t); search(t); }}
            autoFocus
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(s) => s.id}
            renderItem={({ item: song }) => {
              const inQueue = queueIds.has(song.id) || added.has(song.id);
              return (
                <TouchableOpacity
                  onPress={() => !inQueue && handleAdd(song)}
                  activeOpacity={inQueue ? 1 : 0.7}
                  style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: "#1a1a3e" }}>
                    {(song.coverUrl || song.album.coverUrl) ? (
                      <Image source={{ uri: (song.coverUrl || song.album.coverUrl)! }} style={{ width: 44, height: 44 }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#ffffff40" }}>♪</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: inQueue ? "#555" : "#fff", fontSize: 14 }} numberOfLines={1}>{song.title}</Text>
                    <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }} numberOfLines={1}>{song.artist.name}</Text>
                  </View>
                  {inQueue
                    ? <CheckIcon />
                    : (
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#2a2a2a", alignItems: "center", justifyContent: "center" }}>
                        <PlusIcon />
                      </View>
                    )
                  }
                </TouchableOpacity>
              );
            }}
          />
        ) : query.trim() ? (
          <Text style={{ color: "#444", textAlign: "center", marginTop: 40 }}>ไม่พบเพลง</Text>
        ) : (
          <Text style={{ color: "#333", textAlign: "center", marginTop: 40 }}>พิมพ์ชื่อเพลงเพื่อค้นหา</Text>
        )}
      </View>
    </Modal>
  );
};

// ─── QueueScreen ──────────────────────────────────────────────────────────────

export default function QueueScreen() {
  const dispatch = useAppDispatch();
  const { currentSong, queue, currentIndex, repeatMode, isPlaying } = useAppSelector((s) => s.player);
  const [showAddModal, setShowAddModal] = useState(false);

  if (!currentSong) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: "#555" }}>No song playing</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#fff" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const upcomingQueue = queue.slice(currentIndex + 1);
  const queueIds = new Set(queue.map((s) => s.id));

  const modeLabel = repeatMode === "one" ? "วนเพลงนี้" : repeatMode === "all" ? "คิวไหล" : "เล่นตามลำดับ";

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* ── Now Playing header ── */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.9}
        style={{
          paddingTop: 52,
          paddingBottom: 14,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#1e1e1e",
        }}
      >
        <ChevronDown />
        <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: "#1a1a3e" }}>
          {(currentSong.coverUrl || currentSong.album.coverUrl) ? (
            <Image source={{ uri: (currentSong.coverUrl || currentSong.album.coverUrl)! }} style={{ width: 44, height: 44 }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#ffffff30" }}>♪</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#888", fontSize: 11, letterSpacing: 0.5 }}>Now Playing</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 }} numberOfLines={1}>
            "{currentSong.title}" — {currentSong.artist.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); dispatch(togglePlay()); }}
          activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ── Playback Mode Selector ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ color: "#666", fontSize: 11, letterSpacing: 0.5, marginBottom: 10 }}>โหมดการเล่น</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* เล่นตามลำดับ */}
          <TouchableOpacity
            onPress={() => dispatch(setRepeatMode("none"))}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
              gap: 6,
              backgroundColor: repeatMode === "none" ? "#2a2a2a" : "#1a1a1a",
              borderWidth: 1,
              borderColor: repeatMode === "none" ? "#444" : "#1e1e1e",
            }}
          >
            <Text style={{ fontSize: 16 }}>▶</Text>
            <Text style={{ color: repeatMode === "none" ? "#fff" : "#444", fontSize: 11, fontWeight: "600" }}>ตามลำดับ</Text>
          </TouchableOpacity>

          {/* คิวไหล (repeat all) */}
          <TouchableOpacity
            onPress={() => dispatch(setRepeatMode("all"))}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
              gap: 6,
              backgroundColor: repeatMode === "all" ? "#2a2a2a" : "#1a1a1a",
              borderWidth: 1,
              borderColor: repeatMode === "all" ? "#444" : "#1e1e1e",
            }}
          >
            <RepeatAllIcon active={repeatMode === "all"} />
            <Text style={{ color: repeatMode === "all" ? "#fff" : "#444", fontSize: 11, fontWeight: "600" }}>คิวไหล</Text>
          </TouchableOpacity>

          {/* วนเพลงนี้ (repeat one) */}
          <TouchableOpacity
            onPress={() => dispatch(setRepeatMode("one"))}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
              gap: 6,
              backgroundColor: repeatMode === "one" ? "#2a2a2a" : "#1a1a1a",
              borderWidth: 1,
              borderColor: repeatMode === "one" ? "#444" : "#1e1e1e",
            }}
          >
            <RepeatOneIcon active={repeatMode === "one"} />
            <Text style={{ color: repeatMode === "one" ? "#fff" : "#444", fontSize: 11, fontWeight: "600" }}>วนเพลงนี้</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Queue header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <View>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>In Queue</Text>
            <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{modeLabel} · {upcomingQueue.length} เพลงถัดไป</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#2a2a2a",
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
            }}
          >
            <PlusIcon />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>เพิ่มเพลง</Text>
          </TouchableOpacity>
        </View>

        {/* Current song */}
        <QueueRow
          song={currentSong}
          index={currentIndex}
          isActive
          onPress={() => router.back()}
          onRemove={() => {}}
        />

        {/* Upcoming songs */}
        {upcomingQueue.map((song, i) => (
          <QueueRow
            key={`${song.id}-${i}`}
            song={song}
            index={currentIndex + 1 + i}
            isActive={false}
            onPress={() => dispatch(playSong({ song, queue, index: currentIndex + 1 + i }))}
            onRemove={() => dispatch(removeFromQueue(currentIndex + 1 + i))}
          />
        ))}

        {upcomingQueue.length === 0 && (
          <Text style={{ color: "#333", paddingHorizontal: 20, paddingVertical: 16, fontSize: 13, textAlign: "center" }}>
            ไม่มีเพลงถัดไปในคิว{"\n"}กด "เพิ่มเพลง" หรือเปิด คิวไหล เพื่อเล่นต่อ
          </Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Add Songs Modal ── */}
      <AddSongsModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        queueIds={queueIds}
      />
    </View>
  );
}
