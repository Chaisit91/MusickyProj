import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loadLibrary } from "../../store/librarySlice";
import { Artist } from "../../api/homeApi";
import MiniPlayer from "../../Components/player/MiniPlayer";
import BottomNav, { TabName } from "../../Components/layout/Bottomnav";

const { width } = Dimensions.get("window");
const ITEM_W = (width - 48) / 3;

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#888" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </Svg>
);

const SortIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
  </Svg>
);

// ─── Fallback colors ──────────────────────────────────────────────────────────

const COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (i: number) => COLORS[i % COLORS.length];

// ─── Artist Circle Item ───────────────────────────────────────────────────────

const ArtistItem = ({
  artist,
  index,
  onPress,
}: {
  artist: Artist;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{ width: ITEM_W, alignItems: "center", marginBottom: 20 }}
  >
    <View
      style={{
        width: ITEM_W - 8,
        height: ITEM_W - 8,
        borderRadius: (ITEM_W - 8) / 2,
        overflow: "hidden",
        backgroundColor: colorFor(index),
        marginBottom: 8,
      }}
    >
      {artist.imageUrl ? (
        <Image
          source={{ uri: artist.imageUrl }}
          style={{ width: ITEM_W - 8, height: ITEM_W - 8 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>
            {artist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", textAlign: "center" }} numberOfLines={2}>
      {artist.name}
    </Text>
  </TouchableOpacity>
);

// ─── Add More Button ──────────────────────────────────────────────────────────

const AddMoreItem = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{ width: ITEM_W, alignItems: "center", marginBottom: 20 }}
  >
    <View
      style={{
        width: ITEM_W - 8,
        height: ITEM_W - 8,
        borderRadius: (ITEM_W - 8) / 2,
        backgroundColor: "#2a2a2a",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: "#444",
        borderStyle: "dashed",
      }}
    >
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Path fill="#aaa" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </Svg>
    </View>
    <Text style={{ color: "#aaa", fontSize: 12, fontWeight: "600", textAlign: "center" }}>
      Add More
    </Text>
  </TouchableOpacity>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ArtistFollowingScreen() {
  const dispatch = useAppDispatch();
  const followedArtists = useAppSelector((s) => s.library.followedArtists);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabName>("Your Library");

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  const filtered = query.trim()
    ? followedArtists.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase())
      )
    : followedArtists;

  const handleArtistPress = (artist: Artist) => {
    router.push({
      pathname: "/artist/[id]",
      params: {
        id: artist.id,
        name: encodeURIComponent(artist.name),
        imageUrl: artist.imageUrl ? encodeURIComponent(artist.imageUrl) : "",
      },
    });
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Search") router.replace("/search");
  };

  // Append "Add More" as last item
  type GridItem = { type: "artist"; data: Artist } | { type: "add" };
  const gridItems: GridItem[] = [
    ...filtered.map((a) => ({ type: "artist" as const, data: a })),
    { type: "add" as const },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>Artists Following</Text>
        </View>
        <Text style={{ color: "#888", fontSize: 13, marginLeft: 38 }}>
          {followedArtists.length} artists following
        </Text>
      </View>

      {/* ── Search + Sort ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginBottom: 20 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2a2a2a",
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 40,
            gap: 8,
          }}
        >
          <SearchIcon />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#555"
            style={{ flex: 1, color: "#fff", fontSize: 14, padding: 0 }}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "#2a2a2a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SortIcon />
        </TouchableOpacity>
      </View>

      {/* ── Grid ── */}
      {followedArtists.length === 0 && !query ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 }}>
          <Svg width={48} height={48} viewBox="0 0 24 24">
            <Path fill="#333" stroke="#333" strokeWidth={1}
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </Svg>
          <Text style={{ color: "#555", fontSize: 14 }}>Not following any artists yet</Text>
          <TouchableOpacity
            onPress={() => router.replace("/search")}
            activeOpacity={0.8}
            style={{
              marginTop: 4,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: "#2a2a2a",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Find Artists</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gridItems}
          keyExtractor={(item, i) => item.type === "artist" ? item.data.id : `add-${i}`}
          numColumns={3}
          columnWrapperStyle={{ paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 160, paddingTop: 4 }}
          renderItem={({ item, index }) => {
            if (item.type === "add") {
              return <AddMoreItem onPress={() => router.replace("/search")} />;
            }
            return (
              <ArtistItem
                artist={item.data}
                index={index}
                onPress={() => handleArtistPress(item.data)}
              />
            );
          }}
        />
      )}

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
