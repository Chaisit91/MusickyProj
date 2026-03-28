import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import TopBar from "../Components/Topbar";
import BottomNav, { TabName } from "../Components/Bottomnav";

const { width } = Dimensions.get("window");

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#ffffff" d="M8 5v14l11-7z" />
  </Svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = ["For you", "Relax", "Workout", "Travel", "Party"];

const recentlyPlayed = [
  { id: "1", title: "Inside Out", color: "#8B4513" },
  { id: "2", title: "Young", color: "#2F4F4F" },
  { id: "3", title: "Beach House", color: "#8B0000" },
  { id: "4", title: "Kills You", color: "#1a1a2e" },
];

const mixes = [
  { id: "1", title: "Mix 1", subtitle: "Calvin H, Martin\nGarrix, Whi...", color: "#1a1a2e", accent: "#e74c3c" },
  { id: "2", title: "Mix 2", subtitle: "Rahman, Harris\nYuvan, Neh...", color: "#0d0d0d", accent: "#9b59b6" },
  { id: "3", title: "Mix 3", subtitle: "Maroon 5, Martin\nLuther, P...", color: "#1a1a2e", accent: "#3498db" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const AlbumCard = ({ title, color }: { title: string; color: string }) => (
  <View style={{ marginRight: 12, alignItems: "center" }}>
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
      }}
    >
      <View
        style={{
          position: "absolute",
          bottom: 6,
          right: 6,
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: 12,
          padding: 3,
        }}
      >
        <PlayIcon />
      </View>
    </View>
    <Text style={{ color: "#ccc", fontSize: 11, maxWidth: 80 }} numberOfLines={1}>
      {title}
    </Text>
  </View>
);

const MixCard = ({
  title,
  subtitle,
  color,
  accent,
}: {
  title: string;
  subtitle: string;
  color: string;
  accent: string;
}) => (
  <View style={{ marginRight: 12, width: 110 }}>
    <View
      style={{
        width: 110,
        height: 110,
        borderRadius: 10,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: accent + "55",
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: accent,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <Text
        style={{
          position: "absolute",
          color: "#fff",
          fontWeight: "700",
          fontSize: 13,
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
    </View>
    <Text style={{ color: "#aaa", fontSize: 10 }} numberOfLines={2}>
      {subtitle}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = React.useState("For you");
  const [activeTab, setActiveTab] = React.useState<TabName>("Home");

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── TopBar — เพิ่ม paddingTop สำหรับ status bar ── */}
        <View style={{ paddingTop: 36 }}>
          <TopBar
            username="Somsak"
            onPremiumPress={() => console.log("premium")}
            onBellPress={() => console.log("bell")}
            onAvatarPress={() => console.log("avatar")}
          />
        </View>

        {/* ── Category Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 16 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: activeCategory === cat ? "#fff" : "#222",
                borderWidth: activeCategory === cat ? 0 : 1,
                borderColor: "#333",
              }}
            >
              <Text
                style={{
                  color: activeCategory === cat ? "#000" : "#aaa",
                  fontWeight: activeCategory === cat ? "700" : "400",
                  fontSize: 13,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Featuring Today ── */}
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            paddingHorizontal: 20,
            marginBottom: 12,
          }}
        >
          Featuring Today
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          style={{ marginBottom: 28 }}
        >
          {/* Card 1 */}
          <View
            style={{
              width: width * 0.65,
              height: 160,
              borderRadius: 12,
              overflow: "hidden",
              justifyContent: "flex-end",
            }}
          >
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", flexWrap: "wrap" }}>
              {["#8B4513", "#2F4F4F", "#556B2F", "#8B0000", "#4B0082", "#2F4F4F"].map((c, i) => (
                <View key={i} style={{ width: "33%", height: "50%", backgroundColor: c }} />
              ))}
            </View>
            <View style={{ backgroundColor: "rgba(0,0,0,0.55)", padding: 12 }}>
              <Text style={{ color: "#ccc", fontSize: 11 }}>New</Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 1 }}>
                ENGLISH{"\n"}SONGS
              </Text>
            </View>
          </View>

          {/* Card 2 */}
          <View
            style={{
              width: width * 0.55,
              height: 160,
              borderRadius: 12,
              overflow: "hidden",
              justifyContent: "flex-end",
            }}
          >
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", flexWrap: "wrap" }}>
              {["#003366", "#1a472a", "#4a0000", "#2d2d2d"].map((c, i) => (
                <View key={i} style={{ width: "50%", height: "50%", backgroundColor: c }} />
              ))}
            </View>
            <View style={{ backgroundColor: "rgba(0,0,0,0.55)", padding: 12 }}>
              <Text style={{ color: "#ccc", fontSize: 11 }}>Trending</Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 1 }}>
                TOP{"\n"}CHARTS
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ── Recently Played ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            Recently Played
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={{ color: "#aaa", fontSize: 13 }}>See more</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          style={{ marginBottom: 28 }}
        >
          {recentlyPlayed.map((item) => (
            <AlbumCard key={item.id} title={item.title} color={item.color} />
          ))}
        </ScrollView>

        {/* ── Mixes for You ── */}
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            paddingHorizontal: 20,
            marginBottom: 12,
          }}
        >
          Mixes for you
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          style={{ marginBottom: 110 }}
        >
          {mixes.map((item) => (
            <MixCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              color={item.color}
              accent={item.accent}
            />
          ))}
        </ScrollView>
      </ScrollView>

      {/* ── BottomNav component ── */}
      <BottomNav
        activeTab={activeTab}
        onTabPress={(tab) => setActiveTab(tab)}
      />
    </View>
  );
}