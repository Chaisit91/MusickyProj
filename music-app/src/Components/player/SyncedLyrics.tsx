import React, { useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { height: SCREEN_H } = Dimensions.get("window");

interface LyricLine {
  time: number;
  text: string;
}

// ── Parse LRC format ──────────────────────────────────────────────────────────
function parseLRC(lrc: string): LyricLine[] | null {
  const timeRegex = /\[(\d{1,2}):(\d{2})\.(\d{2,3})\]/g;
  const lines = lrc.split("\n");
  const result: LyricLine[] = [];
  let hasTimestamps = false;

  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length === 0) continue;
    hasTimestamps = true;
    const text = line.replace(/\[[\d:.]+\]/g, "").trim();
    if (!text) continue;
    for (const m of matches) {
      const min = parseInt(m[1]);
      const sec = parseInt(m[2]);
      const sub = parseInt(m[3]);
      const time = min * 60 + sec + sub / (m[3].length === 3 ? 1000 : 100);
      result.push({ time, text });
    }
  }

  if (!hasTimestamps || result.length === 0) return null;
  return result.sort((a, b) => a.time - b.time);
}

function getCurrentIndex(lines: LyricLine[], progress: number): number {
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= progress) idx = i;
    else break;
  }
  return idx;
}

// ── Animated lyric line ───────────────────────────────────────────────────────
type LineStatus = "current" | "past" | "future";

const TIMING = { duration: 350, easing: Easing.out(Easing.cubic) };

function LyricItem({
  text,
  status,
  onPress,
}: {
  text: string;
  status: LineStatus;
  onPress: () => void;
}) {
  const opacity = useSharedValue(
    status === "current" ? 1 : status === "past" ? 0.28 : 0.48
  );
  const scale = useSharedValue(status === "current" ? 1 : 0.96);

  useEffect(() => {
    opacity.value = withTiming(
      status === "current" ? 1 : status === "past" ? 0.28 : 0.48,
      TIMING
    );
    scale.value = withTiming(status === "current" ? 1 : 0.96, TIMING);
  }, [status]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      style={{ paddingHorizontal: 28, paddingVertical: 10 }}
    >
      <Animated.Text
        style={[
          animStyle,
          {
            color: "#ffffff",
            fontSize: status === "current" ? 30 : 24,
            fontWeight: status === "current" ? "800" : "600",
            lineHeight: status === "current" ? 42 : 34,
            letterSpacing: 0.2,
          },
        ]}
      >
        {text}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  lyrics: string;
  progressSeconds: number;
  onSeek?: (time: number) => void;
}

export default function SyncedLyrics({ lyrics, progressSeconds, onSeek }: Props) {
  const listRef = useRef<FlatList<LyricLine>>(null);

  const lines = useMemo(() => parseLRC(lyrics), [lyrics]);

  const currentIndex = useMemo(() => {
    if (!lines) return 0;
    return getCurrentIndex(lines, progressSeconds);
  }, [lines, progressSeconds]);

  useEffect(() => {
    if (!lines || lines.length === 0) return;
    listRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0.38,
    });
  }, [currentIndex]);

  const handleSeek = useCallback(
    (time: number) => {
      onSeek?.(time);
    },
    [onSeek]
  );

  // ── Plain text fallback ───────────────────────────────────────────────────
  if (!lines) {
    return (
      <View style={{ paddingHorizontal: 28, paddingBottom: 40 }}>
        <Text
          style={{
            color: "#ffffff",
            fontSize: 22,
            fontWeight: "600",
            lineHeight: 36,
            letterSpacing: 0.2,
            opacity: 0.85,
          }}
        >
          {lyrics}
        </Text>
      </View>
    );
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: LyricLine;
    index: number;
  }) => {
    const status: LineStatus =
      index === currentIndex
        ? "current"
        : index < currentIndex
        ? "past"
        : "future";

    return (
      <LyricItem
        text={item.text}
        status={status}
        onPress={() => handleSeek(item.time)}
      />
    );
  };

  return (
    <FlatList
      ref={listRef}
      data={lines}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      contentContainerStyle={{
        paddingTop: SCREEN_H * 0.32,
        paddingBottom: SCREEN_H * 0.52,
      }}
      onScrollToIndexFailed={(info) => {
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.38,
          });
        }, 300);
      }}
    />
  );
}
