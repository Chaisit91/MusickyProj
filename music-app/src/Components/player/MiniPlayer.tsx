// Player แถบเล็กด้านล่างหน้าจอ — แสดงชื่อเพลง/ศิลปิน/ปก + ปุ่ม play/pause/next | กดเปิดหน้า player เต็มจอ | ซ่อนเมื่อไม่มีเพลงเล่น
//
// หลักการทำงาน:
// 1. ถ้า currentSong เป็น null → return null (ซ่อน component ทั้งหมด)
// 2. mount: slideY จาก 80→0 (spring) + opacity 0→1 (timing) พร้อมกัน
// 3. isPlaying เปลี่ยน: rotation หมุน 360° ใน 7 วิ linear repeat infinite (เล่น) หรือ cancelAnimation (หยุด)
// 4. isPlaying toggle: btnScale spring ลง 0.85 แล้วเด้งกลับ 1.0 (bounce feedback)
// 5. คำนวณ progress ratio (progressSeconds/duration) → แสดง progress bar แนวนอนด้านล่าง
// 6. กด body → router.push("/player"), กด play button (stopPropagation) → dispatch togglePlay
// 7. กด close (stopPropagation) → dispatch stopSong ซ่อน MiniPlayer

// MiniPlayer — แถบ player ขนาดเล็กที่แสดงด้านล่างหน้าจอเมื่อมีเพลงกำลังเล่น
// มี animation เลื่อนขึ้น, หมุน vinyl cover, และ scale ปุ่ม play/pause

import React, { useEffect } from "react";
import {View, Text, TouchableOpacity} from "react-native";
import Animated, {
  useSharedValue,    // สร้าง shared value สำหรับ animation บน native thread
  useAnimatedStyle,  // สร้าง animated style จาก shared values
  withSpring,        // animation แบบ spring (เด้งตามฟิสิกส์)
  withTiming,        // animation แบบ linear/easing
  withRepeat,        // loop animation ซ้ำไม่จำกัด
  cancelAnimation,   // ยกเลิก animation ที่กำลังทำงาน
  Easing,            // easing functions สำหรับ timing animation
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg"; // ใช้วาด icon แบบ SVG vector
import { router } from "expo-router";          // ใช้ navigate ไปหน้า player เต็ม
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // typed Redux hooks
import { togglePlay, stopSong } from "../../store/playerSlice";    // actions สำหรับ play/stop
import { Image } from "expo-image"; // ใช้แทน RN Image เพื่อ performance cache ที่ดีกว่า

// ─── Icons ────────────────────────────────────────────────────────────────────

// PlayIcon — รูปสามเหลี่ยมสีขาว ใช้แสดงเมื่อเพลงหยุดอยู่
const PlayIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#fff" d="M8 5v14l11-7z" />
  </Svg>
);

// PauseIcon — รูปขีดสองเส้นสีขาว ใช้แสดงเมื่อเพลงกำลังเล่น
const PauseIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#fff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

// CloseIcon — รูป X สีเทา ใช้ปิด MiniPlayer และหยุดเพลง
const CloseIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path fill="#666" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Svg>
);

// ─── MiniPlayer ───────────────────────────────────────────────────────────────

export default function MiniPlayer() {
  const dispatch = useAppDispatch(); // ใช้ dispatch action ไปยัง Redux

  // ดึงข้อมูลเพลง, สถานะเล่น, และ progress จาก Redux player state
  const { currentSong, isPlaying, progressSeconds } = useAppSelector((s) => s.player);

  // ── Entrance animation ───────────────────────────────────────────────────
  // slideY เริ่มที่ 80px (นอกจอด้านล่าง) แล้วเลื่อนขึ้นมาที่ 0
  const slideY = useSharedValue(80);
  // opacity เริ่มที่ 0 (โปร่งใส) แล้วค่อย ๆ ปรากฏ
  const opacity = useSharedValue(0);

  useEffect(() => {
    // เมื่อ component mount: เลื่อนขึ้นพร้อม spring animation และ fade in พร้อมกัน
    slideY.value = withSpring(0, { damping: 16, stiffness: 140 }); // spring ที่ดูเป็นธรรมชาติ
    opacity.value = withTiming(1, { duration: 220 });               // fade in 220ms
  }, []); // รันครั้งเดียวตอน mount

  // ── Vinyl rotation ───────────────────────────────────────────────────────
  // rotation เก็บองศาการหมุนของ album cover (0-360)
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      // หมุน 360 องศาใน 7 วินาที แบบ linear ซ้ำไม่สิ้นสุด (-1 = infinite)
      rotation.value = withRepeat(
        withTiming(360, { duration: 7000, easing: Easing.linear }),
        -1,    // loop ไม่จำกัดรอบ
        false, // false = ไม่ reverse (หมุนทิศเดิมตลอด)
      );
    } else {
      // หยุดหมุนเมื่อ pause — album cover ค้างที่องศาปัจจุบัน
      cancelAnimation(rotation);
    }
  }, [isPlaying]); // รันทุกครั้งที่ isPlaying เปลี่ยน

  // ── Play button scale ────────────────────────────────────────────────────
  // btnScale ใช้ทำ bounce effect เมื่อกดปุ่ม play/pause
  const btnScale = useSharedValue(1);
  // prevPlaying ติดตามค่าก่อนหน้าเพื่อตรวจจับการเปลี่ยนแปลง (ใน shared value เพื่อหลีกเลี่ยง re-render)
  const prevPlaying = useSharedValue(isPlaying ? 1 : 0);

  useEffect(() => {
    // ตรวจว่า isPlaying เปลี่ยนจริง ๆ ก่อนทำ animation (ไม่ทำ animation ตอน mount)
    if (prevPlaying.value !== (isPlaying ? 1 : 0)) {
      // scale ลดลงก่อน (กด) แล้วเด้งกลับ (ปล่อย) เพื่อความรู้สึก tactile
      btnScale.value = withSpring(0.85, { damping: 8, stiffness: 300 }, () => {
        btnScale.value = withSpring(1, { damping: 10, stiffness: 200 }); // เด้งกลับ
      });
      prevPlaying.value = isPlaying ? 1 : 0; // อัปเดต prev value
    }
  }, [isPlaying]); // รันทุกครั้งที่ isPlaying เปลี่ยน

  // style สำหรับ container หลัก: ผสม slideY + opacity เป็น animated style
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }], // เลื่อนขึ้น-ลง
    opacity: opacity.value,                     // fade in/out
  }));

  // style สำหรับ album cover: หมุนตาม rotation value
  const vinylStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // style สำหรับปุ่ม play/pause: scale bounce animation
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // ถ้าไม่มีเพลงใน queue ให้ไม่แสดง MiniPlayer
  if (!currentSong) return null;

  // คำนวณ progress ratio (0.0 - 1.0) สำหรับ progress bar
  const duration = currentSong.duration ?? 200; // fallback 200 วินาที ถ้าไม่รู้ duration
  const progress = Math.min(progressSeconds / duration, 1); // clamp ไม่ให้เกิน 100%
  const coverUri = currentSong.coverUrl; // URL ของ album art

  return (
    // Animated.View หลัก: fixed position เหนือ bottom nav bar
    <Animated.View
      style={[
        { position: "absolute", bottom: 96, left: 10, right: 10 }, // วางเหนือ nav bar 96px
        containerStyle, // ผสม slide + opacity animation
      ]}
    >
      {/* กด MiniPlayer เพื่อเปิด player เต็มหน้าจอ */}
      <TouchableOpacity
        onPress={() => router.push("/player")} // navigate ไปหน้า player
        activeOpacity={0.95} // แทบไม่เห็นการกดเพราะ UX ต้องการให้รู้สึก smooth
        style={{
          height: 68,
          borderRadius: 14,
          backgroundColor: "#1c1c1e",    // สีเข้มแบบ iOS dark
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 10,
          paddingRight: 10,
          gap: 12,
          overflow: "hidden",            // clip progress bar ให้อยู่ในขอบ
          borderWidth: 1,
          borderColor: "#2e2e2e",        // ขอบบาง ๆ เพื่อ depth
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 8,                  // Android shadow
        }}
      >
        {/* Progress bar — แถบด้านล่างสุดของ MiniPlayer แสดง progress เพลง */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#2e2e2e" }}>
          {/* แถบ progress สีขาวโปร่งแสง width คำนวณจาก progress ratio */}
          <View style={{ height: 2, width: `${progress * 100}%`, backgroundColor: "#ffffff80" }} />
        </View>

        {/* Album art — vinyl disc style ที่หมุนได้เมื่อเล่นเพลง */}
        <Animated.View
          style={[
            {
              width: 48,
              height: 48,
              borderRadius: 24,      // วงกลม = vinyl disc
              overflow: "hidden",    // clip ให้รูปอยู่ในวงกลม
              backgroundColor: "#2a2a2a", // fallback สีเข้มเมื่อไม่มี cover
            },
            vinylStyle, // animation หมุน
          ]}
        >
          {/* แสดงรูป cover ถ้ามี ไม่งั้นแสดง note icon */}
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={{ width: 48, height: 48 }} contentFit="cover" />
          ) : (
            // fallback เมื่อไม่มี cover art
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#555", fontSize: 20 }}>♪</Text>
            </View>
          )}
        </Animated.View>

        {/* Song info — ชื่อเพลงและชื่อศิลปิน, numberOfLines=1 เพื่อตัดข้อความยาว */}
        <View style={{ flex: 1 }}>
          {/* ชื่อเพลง: ตัวอักษรขาว ตัวหนา */}
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.1 }} numberOfLines={1}>
            {currentSong.title}
          </Text>
          {/* ชื่อศิลปิน: สีเทา ขนาดเล็กกว่า */}
          <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {currentSong.artist.name}
          </Text>
        </View>

        {/* Play / Pause button — มี scale animation เมื่อกด */}
        <Animated.View style={btnStyle}>
          <TouchableOpacity
            // e.stopPropagation() ป้องกัน event bubble ขึ้นไปเปิด player เต็ม
            onPress={(e) => { e.stopPropagation(); dispatch(togglePlay()); }}
            activeOpacity={0.8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,             // ปุ่มกลม
              backgroundColor: "#2e2e3e",   // สีม่วงเข้มโปร่งแสง
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#ffffff18",     // ขอบขาวโปร่งแสงมาก ๆ เพื่อ glass effect
            }}
          >
            {/* แสดง icon ตามสถานะ: Pause เมื่อเล่น, Play เมื่อหยุด */}
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </TouchableOpacity>
        </Animated.View>

        {/* Close button — หยุดเพลงและซ่อน MiniPlayer */}
        <TouchableOpacity
          // e.stopPropagation() ป้องกัน event bubble ขึ้นไปเปิด player เต็ม
          onPress={(e) => { e.stopPropagation(); dispatch(stopSong()); }}
          activeOpacity={0.7}
          style={{ padding: 6 }} // padding เพิ่ม touch area
        >
          <CloseIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}
