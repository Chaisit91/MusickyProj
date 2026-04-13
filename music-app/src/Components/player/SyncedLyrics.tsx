import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, FlatList, Dimensions } from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");
const ITEM_HEIGHT = 56;
const PADDING_TOP = SCREEN_H * 0.3; // ให้บรรทัดปัจจุบันอยู่กลางๆ จอ

interface LyricLine {
  time: number; // วินาที
  text: string;
}

// ── parse LRC format ──────────────────────────────────────────────────────────
// รองรับ [mm:ss.xx] และ [mm:ss.xxx]
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

// ── หา index บรรทัดปัจจุบัน ───────────────────────────────────────────────────
function getCurrentIndex(lines: LyricLine[], progress: number): number {
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= progress) idx = i;
    else break;
  }
  return idx;
}

// ── Synced Lyrics Component ───────────────────────────────────────────────────
interface Props {
  lyrics: string;
  progressSeconds: number;
}

export default function SyncedLyrics({ lyrics, progressSeconds }: Props) {
  const listRef = useRef<FlatList<LyricLine>>(null);

  const lines = useMemo(() => parseLRC(lyrics), [lyrics]);

  const currentIndex = useMemo(() => {
    if (!lines) return 0;
    return getCurrentIndex(lines, progressSeconds);
  }, [lines, progressSeconds]);

  // auto-scroll ไปบรรทัดปัจจุบัน
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    listRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0.35, // วางไว้ประมาณ 1/3 จากบน
    });
  }, [currentIndex]);

  // ── ถ้าไม่ใช่ LRC format → แสดงแบบ plain text ─────────────────────────────
  if (!lines) {
    return (
      <View style={{ paddingHorizontal: 32, paddingBottom: 40 }}>
        <Text style={{ color: "#ddd", fontSize: 16, lineHeight: 30, letterSpacing: 0.3 }}>
          {lyrics}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: LyricLine; index: number }) => {
    const isCurrent = index === currentIndex;
    const isPast = index < currentIndex;

    return (
      <View style={{ minHeight: ITEM_HEIGHT, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 8 }}>
        <Text
          style={{
            color: isCurrent ? "#ffffff" : isPast ? "#444" : "#555",
            fontSize: isCurrent ? 24 : 18,
            fontWeight: isCurrent ? "800" : "500",
            lineHeight: isCurrent ? 34 : 26,
            letterSpacing: isCurrent ? 0.2 : 0,
            // transition effect ผ่าน opacity
            opacity: isCurrent ? 1 : isPast ? 0.4 : 0.55,
          }}
        >
          {item.text}
        </Text>
      </View>
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
        paddingTop: PADDING_TOP,
        paddingBottom: SCREEN_H * 0.5,
      }}
      onScrollToIndexFailed={(info) => {
        // fallback ถ้า scroll ไม่ได้
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.35,
          });
        }, 300);
      }}
    />
  );
}
