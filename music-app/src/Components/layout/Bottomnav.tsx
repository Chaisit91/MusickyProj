import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  Icon,
  active,
  onPress,
}: {
  label: TabName;
  Icon: React.FC<{ active?: boolean }>;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(active ? 1 : 0);
  const dotScale = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(active ? 1.18 : 1, { damping: 10, stiffness: 220 });
    dotOpacity.value = withTiming(active ? 1 : 0, { duration: 200 });
    dotScale.value = withSpring(active ? 1 : 0, { damping: 12, stiffness: 200 });
  }, [active]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ alignItems: "center", gap: 4, paddingHorizontal: 16 }}
    >
      <Animated.View style={iconStyle}>
        <Icon active={active} />
      </Animated.View>
      <Text
        style={{
          color: active ? "#fff" : "#555",
          fontSize: 10,
          fontWeight: active ? "600" : "400",
        }}
      >
        {label}
      </Text>
      {/* Active dot indicator */}
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#fff",
            marginTop: -2,
          },
          dotStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

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
        backgroundColor: "rgba(15, 15, 15, 0.92)",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.07)",
        paddingTop: 12,
        paddingBottom: 28,
        justifyContent: "space-around",
      }}
    >
      {tabs.map(({ label, Icon }) => (
        <TabButton
          key={label}
          label={label}
          Icon={Icon}
          active={activeTab === label}
          onPress={() => onTabPress?.(label)}
        />
      ))}
    </View>
  );
}
