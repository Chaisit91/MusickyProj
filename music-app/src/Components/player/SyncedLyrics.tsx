// แสดงเนื้อเพลงแบบ sync กับ timestamp — parse LRC format, highlight บรรทัดปัจจุบันตาม progressSeconds, scroll อัตโนมัติ, กดบรรทัดเพื่อ seek
//
// หลักการทำงาน:
// 1. parse lyrics ด้วย parseLRC (ตาม timestamp [mm:ss.xx]) → ถ้าไม่มี timestamp ใช้ parsePlainText (แบ่งเวลาเท่าๆกัน)
// 2. useMemo คำนวณ currentIndex ตาม progressSeconds: หา index สุดท้ายที่ line.time <= progress
// 3. สถานะแต่ละบรรทัด: current/past/future → กำหนด opacity, scale, font-size, color ต่างกัน
// 4. Animated.parallel: animate opacity + scale เมื่อ status เปลี่ยน (350ms)
// 5. useEffect auto-scroll: เมื่อ currentIndex เปลี่ยน → scrollRef.scrollTo ให้บรรทัดปัจจุบันอยู่ที่ 35% จากบน
// 6. กดบรรทัด: เรียก onSeek(line.time) ให้ AudioController seek ไปยังเวลานั้น

// SyncedLyrics — Component แสดงเนื้อเพลงแบบ sync กับเวลาเพลง
// รองรับทั้ง LRC format (มี timestamp) และ plain text (ประมาณเวลาจาก duration)
// ผู้ใช้กดบรรทัดเนื้อเพลงเพื่อ seek ไปยังเวลานั้นได้

import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,       // ใช้ RN Animated (ไม่ใช่ Reanimated) เพราะ opacity/scale บน UI thread เพียงพอ
  Dimensions,     // ดึงขนาดหน้าจอสำหรับคำนวณ scroll position
} from "react-native";

// ดึงความสูงหน้าจอไว้คำนวณ padding และ scroll offset
const { height: SCREEN_H } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

// โครงสร้างข้อมูลของแต่ละบรรทัดเนื้อเพลง
interface LyricLine {
  time: number; // เวลาที่บรรทัดนี้ควรแสดง (หน่วย: วินาที)
  text: string; // ข้อความเนื้อเพลง
}

// ── Parse LRC format [mm:ss.xx] ───────────────────────────────────────────────
// แปลงข้อความ LRC format เป็น array ของ LyricLine พร้อม timestamp
// คืน null ถ้าไม่มี timestamp เลย (เพื่อ fallback ไป parsePlainText)
function parseLRC(lrc: string): LyricLine[] | null {
  // regex จับ timestamp รูปแบบ [mm:ss.xx] หรือ [mm:ss.xxx]
  const timeRegex = /\[(\d{1,2}):(\d{2})\.(\d{2,3})\]/g;
  const lines = lrc.split("\n"); // แยกบรรทัด
  const result: LyricLine[] = [];
  let hasTimestamps = false; // ตัวตรวจสอบว่ามี timestamp จริง ๆ หรือเปล่า

  for (const line of lines) {
    // หา timestamp ทั้งหมดในบรรทัด (LRC อนุญาตให้หนึ่งบรรทัดมีหลาย timestamp)
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length === 0) continue; // ข้ามบรรทัดที่ไม่มี timestamp (เช่น metadata)
    hasTimestamps = true;

    // ตัด timestamp ออกเหลือเฉพาะข้อความเนื้อเพลง
    const text = line.replace(/\[[\d:.]+\]/g, "").trim();
    if (!text) continue; // ข้ามถ้าไม่มีข้อความ (บรรทัดว่าง)

    // สร้าง LyricLine สำหรับแต่ละ timestamp ในบรรทัด
    for (const m of matches) {
      const min = parseInt(m[1]); // นาที
      const sec = parseInt(m[2]); // วินาที
      const sub = parseInt(m[3]); // ส่วนย่อย (centisecond หรือ millisecond)
      // แปลง centisecond (2 หลัก) หรือ millisecond (3 หลัก) เป็น decimal วินาที
      const time = min * 60 + sec + sub / (m[3].length === 3 ? 1000 : 100);
      result.push({ time, text });
    }
  }

  // ถ้าไม่มี timestamp เลย หรือ parse ไม่ได้ผล คืน null เพื่อ fallback
  if (!hasTimestamps || result.length === 0) return null;
  // เรียงลำดับตามเวลา (LRC อาจไม่เรียงมาแต่แรก)
  return result.sort((a, b) => a.time - b.time);
}

// ── Fallback: split plain text by newlines, estimate timing ──────────────────
// แปลง plain text เป็น LyricLine โดยประมาณเวลาแต่ละบรรทัดจาก duration
function parsePlainText(lrc: string, duration: number): LyricLine[] {
  const lines = lrc
    .split("\n")
    .map((l) => l.trim()) // ตัด whitespace หัวท้าย
    .filter(Boolean);     // กรองบรรทัดว่างออก
  if (lines.length === 0) return [];
  // หาร duration ด้วยจำนวนบรรทัด เพื่อให้แต่ละบรรทัดแสดงนานเท่ากัน
  // ถ้า duration ไม่รู้ (0) ใช้ค่า default 3 วินาทีต่อบรรทัด
  const step = duration > 0 ? duration / lines.length : 3;
  // สร้าง LyricLine โดยประมาณเวลาจาก index
  return lines.map((text, i) => ({ time: i * step, text }));
}

// หา index บรรทัดที่ควรแสดง (current) ตาม progress ปัจจุบัน
// คืน index ของบรรทัดสุดท้ายที่ time <= progress
function getCurrentIndex(lines: LyricLine[], progress: number): number {
  let idx = 0; // เริ่มที่บรรทัดแรก
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= progress) idx = i; // อัปเดต index เมื่อยังไม่ถึงเวลาข้างหน้า
    else break; // หยุดทันทีเมื่อเจอบรรทัดที่เวลามากกว่า progress
  }
  return idx;
}

// ── Single animated lyric line ────────────────────────────────────────────────
// Status บอกสถานะของแต่ละบรรทัดเทียบกับเวลาปัจจุบัน
type Status = "current" | "past" | "future";

// LyricLine component สำหรับแสดงบรรทัดเดียว — มี animation opacity + scale ตาม status
function LyricLine({
  text,
  status,
  onPress,   // callback เมื่อผู้ใช้กดบรรทัดนี้เพื่อ seek
  onLayout,  // callback รับ y position สำหรับ auto-scroll
}: {
  text: string;
  status: Status;
  onPress: () => void;
  onLayout: (y: number) => void;
}) {
  // opacity เริ่มตาม status: current=1, past=0.45 (จาง), future=0.18 (จางมาก)
  const opacity = useRef(
    new Animated.Value(status === "current" ? 1 : status === "past" ? 0.45 : 0.18)
  ).current;
  // scale เริ่มตาม status: current=1 (เต็ม), อื่น ๆ =0.92 (เล็กกว่านิด)
  const scale = useRef(new Animated.Value(status === "current" ? 1 : 0.92)).current;

  useEffect(() => {
    // animate ทั้ง opacity และ scale พร้อมกันเมื่อ status เปลี่ยน
    Animated.parallel([
      Animated.timing(opacity, {
        // ค่าปลายทางขึ้นกับ status ใหม่
        toValue: status === "current" ? 1 : status === "past" ? 0.45 : 0.18,
        duration: 350,              // 350ms ให้ transition ดูนุ่มนวล
        useNativeDriver: true,      // ทำงานบน native thread เพื่อ performance
      }),
      Animated.timing(scale, {
        toValue: status === "current" ? 1 : 0.92, // current โต, อื่น ๆ เล็กกว่า
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(); // เริ่ม animation ทั้งสอง
  }, [status]); // รันทุกครั้งที่ status เปลี่ยน (เมื่อเพลงเดินหน้า)

  // สีข้อความตาม status
  const color =
    status === "current" ? "#ffffff" :   // ขาวสว่างสุดสำหรับบรรทัดปัจจุบัน
    status === "past" ? "#9ca3af" :       // เทาอ่อนสำหรับบรรทัดที่ผ่านไปแล้ว
    "#374151";                            // เทาเข้มสำหรับบรรทัดที่ยังไม่ถึง

  return (
    // TouchableOpacity ให้ผู้ใช้กดบรรทัดเพื่อ seek ไปยังเวลานั้น
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      // onLayout รับ y position เมื่อ component วาง layout — ใช้สำหรับ auto-scroll
      onLayout={(e) => onLayout(e.nativeEvent.layout.y)}
    >
      <Animated.Text
        style={{
          opacity,                   // animated opacity
          transform: [{ scale }],    // animated scale
          color,                     // สีตาม status
          // current บรรทัดใหญ่กว่า เพื่อเน้นให้ผู้ใช้อ่านง่าย
          fontSize: status === "current" ? 32 : 22,
          fontWeight: status === "current" ? "800" : "600",
          lineHeight: status === "current" ? 44 : 32,
          letterSpacing: 0.2,
          paddingHorizontal: 28, // padding ซ้าย-ขวาให้ข้อความไม่ชิดขอบ
          paddingVertical: 10,   // padding บน-ล่างเพื่อให้กดง่ายขึ้น
        }}
      >
        {text}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
// Props ของ SyncedLyrics component หลัก
interface Props {
  lyrics: string;           // ข้อความเนื้อเพลง (LRC format หรือ plain text)
  progressSeconds: number;  // progress ปัจจุบัน (วินาที) จาก audio player
  durationSeconds: number;  // ความยาวเพลงทั้งหมด (วินาที) ใช้คำนวณ plain text timing
  onSeek?: (time: number) => void; // callback เมื่อผู้ใช้กดบรรทัดเพื่อ seek
}

export default function SyncedLyrics({ lyrics, progressSeconds, durationSeconds, onSeek }: Props) {
  // ref ของ ScrollView เพื่อ programmatic scroll
  const scrollRef = useRef<ScrollView>(null);
  // เก็บ y position ของแต่ละบรรทัดสำหรับคำนวณ auto-scroll
  const itemYs = useRef<Record<number, number>>({});

  // parse lyrics เป็น array ของ LyricLine — useMemo เพราะ parse ทีเดียวพอ
  const lines = useMemo(() => {
    const lrc = parseLRC(lyrics); // ลองแปลงเป็น LRC ก่อน
    if (lrc) return lrc; // ถ้าสำเร็จ ใช้ LRC ที่มี timestamp
    // plain text fallback — ประมาณเวลาจาก duration
    // fallback duration เป็น 180 วินาที (3 นาที) ถ้า durationSeconds ไม่รู้
    return parsePlainText(lyrics, durationSeconds > 0 ? durationSeconds : 180);
  }, [lyrics, durationSeconds]); // คำนวณใหม่เมื่อ lyrics หรือ duration เปลี่ยน

  // หา index บรรทัดปัจจุบันตาม progressSeconds — useMemo เพราะรันทุก frame อาจแพง
  const currentIndex = useMemo(
    () => getCurrentIndex(lines, progressSeconds),
    [lines, progressSeconds] // คำนวณใหม่ทุกครั้งที่ progress เดินหน้า
  );

  // Auto-scroll ให้บรรทัดปัจจุบันอยู่กลางหน้าจอเสมอ
  useEffect(() => {
    const y = itemYs.current[currentIndex]; // ดึง y position ของบรรทัดปัจจุบัน
    if (y == null) return; // ยังไม่รู้ position (layout ยังไม่เสร็จ)
    scrollRef.current?.scrollTo({
      // เลื่อน scroll ให้บรรทัดปัจจุบันอยู่ที่ 35% จากบนหน้าจอ (เกือบกลาง)
      y: Math.max(0, y - SCREEN_H * 0.35),
      animated: true, // scroll แบบ smooth
    });
  }, [currentIndex]); // รันทุกครั้งที่ current line เปลี่ยน

  // ถ้าไม่มีเนื้อเพลง (parse ไม่ได้ผลเลย) แสดงข้อความแจ้งเตือน
  if (lines.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#555", fontSize: 15 }}>ไม่มีเนื้อเพลง</Text>
      </View>
    );
  }

  return (
    // ScrollView แบบ vertical สำหรับแสดงเนื้อเพลงทั้งหมด
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false} // ซ่อน scroll bar เพื่อ UI สะอาด
      scrollEnabled // ผู้ใช้ scroll เองได้ (override auto-scroll ชั่วคราว)
      contentContainerStyle={{
        // padding ด้านบนให้บรรทัดแรกอยู่กลาง-ล่าง เมื่อ scroll ขึ้นสุด
        paddingTop: SCREEN_H * 0.3,
        // padding ด้านล่างให้บรรทัดสุดท้ายอยู่กลางหน้าจอได้
        paddingBottom: SCREEN_H * 0.5,
      }}
    >
      {/* render บรรทัดเนื้อเพลงทุกบรรทัด */}
      {lines.map((line, index) => {
        // กำหนด status ของแต่ละบรรทัดเทียบกับบรรทัดปัจจุบัน
        const status: Status =
          index === currentIndex
            ? "current"        // บรรทัดที่กำลังเล่นอยู่
            : index < currentIndex
            ? "past"           // บรรทัดที่ผ่านมาแล้ว
            : "future";        // บรรทัดที่ยังไม่ถึง

        return (
          <LyricLine
            key={index} // ใช้ index เป็น key เพราะ lyrics ไม่มี unique id
            text={line.text}
            status={status}
            // กดบรรทัดเพื่อ seek ไปยังเวลาของบรรทัดนั้น
            onPress={() => onSeek?.(line.time)}
            // บันทึก y position ของแต่ละบรรทัดเพื่อใช้ใน auto-scroll
            onLayout={(y) => {
              itemYs.current[index] = y;
            }}
          />
        );
      })}
    </ScrollView>
  );
}
