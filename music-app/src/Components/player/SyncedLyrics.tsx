import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");

interface LyricLine {
  time: number;
  text: string;
}

// ── Parse LRC format [mm:ss.xx] ───────────────────────────────────────────────
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

// ── Fallback: split plain text by newlines, estimate timing ──────────────────
function parsePlainText(lrc: string, duration: number): LyricLine[] {
  const lines = lrc
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const step = duration > 0 ? duration / lines.length : 3;
  return lines.map((text, i) => ({ time: i * step, text }));
}

function getCurrentIndex(lines: LyricLine[], progress: number): number {
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= progress) idx = i;
    else break;
  }
  return idx;
}

// ── Single animated lyric line ────────────────────────────────────────────────
type Status = "current" | "past" | "future";

function LyricLine({
  text,
  status,
  onPress,
  onLayout,
}: {
  text: string;
  status: Status;
  onPress: () => void;
  onLayout: (y: number) => void;
}) {
  const opacity = useRef(
    new Animated.Value(status === "current" ? 1 : status === "past" ? 0.45 : 0.18)
  ).current;
  const scale = useRef(new Animated.Value(status === "current" ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: status === "current" ? 1 : status === "past" ? 0.45 : 0.18,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: status === "current" ? 1 : 0.92,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [status]);

  const color =
    status === "current" ? "#ffffff" : status === "past" ? "#9ca3af" : "#374151";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      onLayout={(e) => onLayout(e.nativeEvent.layout.y)}
    >
      <Animated.Text
        style={{
          opacity,
          transform: [{ scale }],
          color,
          fontSize: status === "current" ? 32 : 22,
          fontWeight: status === "current" ? "800" : "600",
          lineHeight: status === "current" ? 44 : 32,
          letterSpacing: 0.2,
          paddingHorizontal: 28,
          paddingVertical: 10,
        }}
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
  durationSeconds: number;
  onSeek?: (time: number) => void;
}

export default function SyncedLyrics({ lyrics, progressSeconds, durationSeconds, onSeek }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const itemYs = useRef<Record<number, number>>({});

  const lines = useMemo(() => {
    const lrc = parseLRC(lyrics);
    if (lrc) return lrc;
    // plain text fallback — estimate timing from duration
    return parsePlainText(lyrics, durationSeconds > 0 ? durationSeconds : 180);
  }, [lyrics, durationSeconds]);

  const currentIndex = useMemo(
    () => getCurrentIndex(lines, progressSeconds),
    [lines, progressSeconds]
  );

  // Auto-scroll to current line
  useEffect(() => {
    const y = itemYs.current[currentIndex];
    if (y == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - SCREEN_H * 0.35),
      animated: true,
    });
  }, [currentIndex]);

  if (lines.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#555", fontSize: 15 }}>ไม่มีเนื้อเพลง</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      scrollEnabled
      contentContainerStyle={{
        paddingTop: SCREEN_H * 0.3,
        paddingBottom: SCREEN_H * 0.5,
      }}
    >
      {lines.map((line, index) => {
        const status: Status =
          index === currentIndex
            ? "current"
            : index < currentIndex
            ? "past"
            : "future";

        return (
          <LyricLine
            key={index}
            text={line.text}
            status={status}
            onPress={() => onSeek?.(line.time)}
            onLayout={(y) => {
              itemYs.current[index] = y;
            }}
          />
        );
      })}
    </ScrollView>
  );
}
