import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { savePreferences, setPreferenceLocal } from "../../store/preferencesSlice";

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </Svg>
);

interface Language {
  label: string;
  native: string;
}

const LANGUAGES: Language[] = [
  { label: "English", native: "English" },
  { label: "Thai", native: "ไทย" },
  { label: "Korean", native: "한국어" },
  { label: "Japanese", native: "日本語" },
  { label: "Chinese", native: "中文" },
  { label: "Spanish", native: "Español" },
  { label: "French", native: "Français" },
  { label: "German", native: "Deutsch" },
  { label: "Portuguese", native: "Português" },
  { label: "Italian", native: "Italiano" },
  { label: "Russian", native: "Русский" },
  { label: "Arabic", native: "العربية" },
];

export default function MusicLanguageScreen() {
  const dispatch = useAppDispatch();
  const musicLanguages = useAppSelector((s) => s.preferences.musicLanguages);
  const [selected, setSelected] = useState<string[]>(musicLanguages);

  useEffect(() => {
    setSelected(musicLanguages);
  }, [musicLanguages]);

  const toggleLanguage = (lang: string) => {
    let next: string[];
    if (selected.includes(lang)) {
      if (selected.length === 1) return;
      next = selected.filter((l) => l !== lang);
    } else {
      next = [...selected, lang];
    }
    setSelected(next);
    dispatch(setPreferenceLocal({ musicLanguages: next }));
    dispatch(savePreferences({ musicLanguages: next }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginRight: 16 }}>
            <BackIcon />
          </TouchableOpacity>
          <View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Music Language</Text>
            <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
              {selected.length} selected
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        <Text style={{ color: "#888", fontSize: 13, paddingHorizontal: 20, marginVertical: 16, lineHeight: 20 }}>
          เลือกภาษาเพลงที่คุณชื่นชอบ เราจะแนะนำเพลงตามภาษาที่คุณเลือก
        </Text>

        {/* Language list */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {LANGUAGES.map((lang) => {
            const isSelected = selected.includes(lang.label);
            return (
              <TouchableOpacity
                key={lang.label}
                onPress={() => toggleLanguage(lang.label)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isSelected ? "#3b1f6e" : "#1e1e1e",
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: isSelected ? 1.5 : 0,
                  borderColor: isSelected ? "#7c3aed" : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{lang.label}</Text>
                  <Text style={{ color: "#888", fontSize: 12, marginTop: 3 }}>{lang.native}</Text>
                </View>
                {isSelected && <CheckIcon />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
