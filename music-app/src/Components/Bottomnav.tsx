import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = ({ active }: { active?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill={active ? "#ffffff" : "#555"} d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </Svg>
);

const SearchIcon = ({ active }: { active?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={active ? "#ffffff" : "#555"}
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
    />
  </Svg>
);

const LibraryIcon = ({ active }: { active?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={active ? "#ffffff" : "#555"}
      d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"
    />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabName = "Home" | "Search" | "Your Library";

interface BottomNavProps {
  activeTab?: TabName;
  onTabPress?: (tab: TabName) => void;
}

const tabs: { label: TabName; Icon: React.FC<{ active?: boolean }> }[] = [
  { label: "Home", Icon: HomeIcon },
  { label: "Search", Icon: SearchIcon },
  { label: "Your Library", Icon: LibraryIcon },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BottomNav({ activeTab = "Home", onTabPress }: BottomNavProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: "rgba(15, 15, 15, 0.85)",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.07)",
        paddingTop: 12,
        paddingBottom: 28,
        justifyContent: "space-around",
      }}
    >
      {tabs.map(({ label, Icon }) => {
        const active = activeTab === label;
        return (
          <TouchableOpacity
            key={label}
            activeOpacity={0.7}
            onPress={() => onTabPress?.(label)}
            style={{ alignItems: "center", gap: 4 }}
          >
            <Icon active={active} />
            <Text
              style={{
                color: active ? "#fff" : "#555",
                fontSize: 10,
                fontWeight: active ? "600" : "400",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}