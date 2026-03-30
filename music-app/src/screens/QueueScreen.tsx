import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Switch,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  playSong,
  removeFromQueue,
  togglePlay,
  nextSong,
} from "../store/playerSlice";
import { Song } from "../api/homeApi";

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

const MoreIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Circle cx={5} cy={12} r={2} fill="#555" />
    <Circle cx={12} cy={12} r={2} fill="#555" />
    <Circle cx={19} cy={12} r={2} fill="#555" />
  </Svg>
);

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#fff" d="M8 5v14l11-7z" />
  </Svg>
);

// Equalizer bars animation (static version)
const EqualizerIcon = ({ active }: { active: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Rect x={2} y={active ? 10 : 6} width={4} height={active ? 14 : 18} rx={1} fill={active ? "#fff" : "#555"} />
    <Rect x={10} y={active ? 4 : 8} width={4} height={active ? 20 : 16} rx={1} fill={active ? "#fff" : "#555"} />
    <Rect x={18} y={active ? 8 : 4} width={4} height={active ? 16 : 20} rx={1} fill={active ? "#fff" : "#555"} />
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
    {/* Drag handle */}
    <View style={{ padding: 4 }}>
      <DragIcon />
    </View>

    {/* Cover */}
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: colorFor(index),
      }}
    >
      {song.album.coverUrl ? (
        <Image source={{ uri: song.album.coverUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ffffff60" }}>♪</Text>
        </View>
      )}
    </View>

    {/* Info */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: isActive ? "#fff" : "#ccc",
          fontSize: 14,
          fontWeight: isActive ? "700" : "400",
        }}
        numberOfLines={1}
      >
        {song.title}
      </Text>
      <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
        {song.artist.name}
        {song.album.title ? ` · ${song.album.title}` : ""}
      </Text>
    </View>

    {/* Equalizer / indicator */}
    <View style={{ padding: 4 }}>
      <EqualizerIcon active={isActive} />
    </View>

    {/* More */}
    <TouchableOpacity
      onPress={onRemove}
      activeOpacity={0.7}
      style={{ padding: 6 }}
    >
      <MoreIcon />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── QueueScreen ──────────────────────────────────────────────────────────────

export default function QueueScreen() {
  const dispatch = useAppDispatch();
  const { currentSong, queue, currentIndex, isPlaying } = useAppSelector((s) => s.player);
  const [autoRec, setAutoRec] = useState(true);

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

  // Songs after current index
  const upcomingQueue = queue.slice(currentIndex + 1);

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* ── Collapsed Now Playing Header ── */}
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

        {/* Small album art */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            overflow: "hidden",
            backgroundColor: "#1a1a3e",
          }}
        >
          {currentSong.album.coverUrl ? (
            <Image source={{ uri: currentSong.album.coverUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
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

        {/* Mini play button */}
        <TouchableOpacity
          onPress={() => dispatch(togglePlay())}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlayIcon size={16} />
        </TouchableOpacity>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── In Queue ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>In Queue</Text>
          <Text style={{ color: "#555", fontSize: 13 }}>{upcomingQueue.length} songs</Text>
        </View>

        {/* Current song highlighted */}
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
            onPress={() =>
              dispatch(playSong({ song, queue, index: currentIndex + 1 + i }))
            }
            onRemove={() => dispatch(removeFromQueue(currentIndex + 1 + i))}
          />
        ))}

        {upcomingQueue.length === 0 && (
          <Text style={{ color: "#444", paddingHorizontal: 20, paddingVertical: 12, fontSize: 13 }}>
            No more songs in queue
          </Text>
        )}

        {/* ── Auto-recommendations ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: "#1e1e1e",
            marginTop: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
            Auto-recommendations
          </Text>
          <Switch
            value={autoRec}
            onValueChange={setAutoRec}
            trackColor={{ false: "#333", true: "#ffffff50" }}
            thumbColor={autoRec ? "#fff" : "#555"}
          />
        </View>

        {/* Recommended songs (all songs from queue reordered) */}
        {autoRec &&
          queue
            .slice(0, 6)
            .filter((_, i) => i !== currentIndex)
            .map((song, i) => (
              <QueueRow
                key={`rec-${song.id}-${i}`}
                song={song}
                index={i}
                isActive={false}
                onPress={() => dispatch(playSong({ song, queue, index: i }))}
                onRemove={() => {}}
              />
            ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
