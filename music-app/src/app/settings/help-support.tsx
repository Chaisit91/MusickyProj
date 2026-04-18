import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StatusBar,
  FlatList, ActivityIndicator, KeyboardAvoidingView,
  RefreshControl, Alert, ScrollView,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import axios from "axios";
import { useAppSelector } from "../../store/hooks";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);
const CheckIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

const ISSUE_TYPES = [
  { label: "เพลงไม่เล่นได้",              sublabel: "ปัญหาการเล่นเพลง" },
  { label: "เข้าสู่ระบบไม่ได้",            sublabel: "ปัญหาบัญชี" },
  { label: "แอปทำงานผิดปกติ",             sublabel: "ข้อผิดพลาดในแอป" },
  { label: "ปัญหาการชำระเงิน Premium",    sublabel: "ชำระเงิน / Premium" },
  { label: "ปัญหาการดาวน์โหลด",           sublabel: "การดาวน์โหลด" },
  { label: "ต้องการคำแนะนำ",              sublabel: "ทั่วไป" },
  { label: "ปัญหาอื่นๆ",                  sublabel: "อื่นๆ" },
];

interface Message {
  id: string;
  sender: "USER" | "ADMIN";
  content: string;
  createdAt: string;
}

export default function HelpSupportScreen() {
  const token = useAppSelector((s) => s.auth.accessToken);

  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedType, setSelectedType] = useState(ISSUE_TYPES[0].label);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const initChat = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_URL}/support/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tickets = res.data.data ?? [];
      if (tickets.length > 0) {
        const latest = tickets[0];
        setTicketId(latest.id);
        setTicketSubject(latest.subject ?? "");
        setMessages(latest.messages ?? []);
      }
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { initChat(); }, [initChat]);

  const refresh = async () => {
    setRefreshing(true);
    await initChat();
    setRefreshing(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => { if (messages.length > 0) scrollToBottom(); }, [messages.length]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content || !token) return;
    setSending(true);
    setText("");
    try {
      if (!ticketId) {
        const res = await axios.post(
          `${API_URL}/support`,
          { subject: selectedType, description: content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTicketId(res.data.data.id);
        setTicketSubject(res.data.data.subject);
        setMessages(res.data.data.messages ?? []);
      } else {
        const res = await axios.post(
          `${API_URL}/support/my/${ticketId}/reply`,
          { content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages((prev) => [...prev, res.data.data]);
      }
      scrollToBottom();
    } catch (err: any) {
      setText(content);
      const msg = err?.response?.data?.message ?? "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่";
      Alert.alert("เกิดข้อผิดพลาด", msg);
    } finally {
      setSending(false);
    }
  };

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.sender === "USER";
    const prev = messages[index - 1];
    const showDate =
      !prev ||
      new Date(item.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
    return (
      <>
        {showDate && (
          <Text style={{ color: "#555", fontSize: 11, textAlign: "center", marginVertical: 12 }}>
            {new Date(item.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}
          </Text>
        )}
        <View style={{ flexDirection: "row", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 6, paddingHorizontal: 12 }}>
          {!isUser && (
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center", marginRight: 8, alignSelf: "flex-end" }}>
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>A</Text>
            </View>
          )}
          <View style={{ maxWidth: "75%" }}>
            {!isUser && <Text style={{ color: "#a78bfa", fontSize: 10, fontWeight: "700", marginBottom: 3 }}>Admin</Text>}
            <View style={{
              backgroundColor: isUser ? "#7c3aed" : "#1e1e1e",
              borderRadius: 18,
              borderBottomRightRadius: isUser ? 4 : 18,
              borderBottomLeftRadius: isUser ? 18 : 4,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}>
              <Text style={{ color: "#fff", fontSize: 15, lineHeight: 22 }}>{item.content}</Text>
            </View>
            <Text style={{ color: "#444", fontSize: 10, marginTop: 3, textAlign: isUser ? "right" : "left" }}>
              {fmtTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111" }}
      behavior="padding"
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1e1e1e", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>A</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Admin Support</Text>
          {ticketSubject ? (
            <Text style={{ color: "#a78bfa", fontSize: 12 }} numberOfLines={1}>{ticketSubject}</Text>
          ) : (
            <Text style={{ color: "#555", fontSize: 12 }}>ทีมงาน Musicky</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#7c3aed" />
        </View>
      ) : ticketId ? (
        /* ── Chat view (ticket exists) ── */
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#7c3aed" />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          style={{ flex: 1 }}
          onContentSizeChange={scrollToBottom}
        />
      ) : (
        /* ── New ticket: issue type selector ── */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#7c3aed" />}
        >
          <View style={{ backgroundColor: "#1a2040", borderRadius: 12, padding: 14, flexDirection: "row", gap: 8, marginBottom: 20 }}>
            <Text style={{ fontSize: 16 }}>ℹ️</Text>
            <Text style={{ color: "#6b84d4", fontSize: 13, flex: 1, lineHeight: 20 }}>
              เลือกประเภทปัญหาและพิมพ์รายละเอียด ทีมงานจะตอบกลับโดยเร็วที่สุด
            </Text>
          </View>

          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 10 }}>ประเภทปัญหา</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {ISSUE_TYPES.map((item) => {
              const isSelected = selectedType === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => setSelectedType(item.label)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: isSelected ? "#3b1f6e" : "#1e1e1e",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: isSelected ? 1.5 : 0,
                    borderColor: isSelected ? "#7c3aed" : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{item.label}</Text>
                    <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{item.sublabel}</Text>
                  </View>
                  {isSelected && <CheckIcon />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Input */}
      <View style={{ flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#1e1e1e", alignItems: "flex-end" }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={ticketId ? "พิมพ์ข้อความ..." : "อธิบายปัญหาของคุณ..."}
          placeholderTextColor="#555"
          multiline
          style={{
            flex: 1,
            backgroundColor: "#1e1e1e",
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: "#fff",
            fontSize: 15,
            maxHeight: 120,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: text.trim() ? "#7c3aed" : "#1e1e1e",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path fill={text.trim() ? "#fff" : "#444"} d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </Svg>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
