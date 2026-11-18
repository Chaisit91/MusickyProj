import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setOnline } from "../../store/networkSlice";

export default function OfflineBanner() {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((s) => s.network.isOnline);

  // visible = banner อยู่บน screen (ไม่ว่าจะ offline หรือ "กลับมาแล้ว")
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-60)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      dispatch(setOnline(state.isConnected ?? true));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (!isOnline) {
      // แสดง banner ออฟไลน์
      setVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else if (visible) {
      // เพิ่งกลับมาออนไลน์ → แสดงข้อความ "กลับมาแล้ว" 1.5 วิ แล้วซ่อน
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 1500);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isOnline]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: isOnline ? "#16a34a" : "#dc2626",
          paddingVertical: 10,
          paddingHorizontal: 16,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isOnline ? "#86efac" : "#fca5a5",
          }}
        />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
          {isOnline ? "กลับมาออนไลน์แล้ว" : "ไม่มีการเชื่อมต่ออินเทอร์เน็ต"}
        </Text>
      </View>
    </Animated.View>
  );
}
