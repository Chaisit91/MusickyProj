import React, { useEffect, useState } from "react";
import {View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator} from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { getRecentlyPlayed, PlayHistoryItem, Song } from "../../api/homeApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { playSong } from "../../store/playerSlice";
import { loadLibrary } from "../../store/librarySlice";
import { colorFor } from "../../constants";
import MiniPlayer from "../../Components/player/MiniPlayer";
import BottomNav, { TabName } from "../../Components/layout/Bottomnav";
import { Image } from "expo-image";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HeartIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill="#e84393"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </Svg>
);

const DownloadIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path fill="#4fc3f7" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </Svg>
);

const PlaylistIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill="#a78bfa"
      d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
    />
  </Svg>
);

const ArtistIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill="#34d399"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Circle cx={5} cy={12} r={2} fill="#666" />
    <Circle cx={12} cy={12} r={2} fill="#666" />
    <Circle cx={19} cy={12} r={2} fill="#666" />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </Svg>
);

// ─── Library Card ─────────────────────────────────────────────────────────────

const LibraryCard = ({
  icon,
  label,
  count,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  count: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{
      flex: 1,
      backgroundColor: "#1e1e1e",
      borderRadius: 12,
      padding: 16,
      minHeight: 90,
      justifyContent: "space-between",
    }}
  >
    {icon}
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{count}</Text>
    </View>
  </TouchableOpacity>
);

// ─── Song Row ─────────────────────────────────────────────────────────────────

const SongRow = ({
  item,
  index,
  onPress,
}: {
  item: PlayHistoryItem;
  index: number;
  onPress: () => void;
}) => {
  const { song } = item;
  const coverUri = song.coverUrl;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          overflow: "hidden",
          backgroundColor: colorFor(index),
        }}
      >
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={{ width: 48, height: 48 }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#ffffff60", fontSize: 18 }}>♪</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {song.artist.name} · {song.album.title}
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} style={{ padding: 6 }}>
        <MoreIcon />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── Main YourLibraryScreen ───────────────────────────────────────────────────

export default function YourLibraryScreen() {
  const dispatch = useAppDispatch();
  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const followedArtists = useAppSelector((s) => s.library.followedArtists);
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);
  const playlists = useAppSelector((s) => s.library.playlists);
  const [recentItems, setRecentItems] = useState<PlayHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("Your Library");

  useEffect(() => {
    dispatch(loadLibrary());
    getRecentlyPlayed(5)
      .then(setRecentItems)
      .finally(() => setLoading(false));
  }, []);

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Search") router.replace("/search");
  };

  const handleSongPress = (song: Song, allSongs: Song[]) => {
    dispatch(playSong({ song, queue: allSongs }));
  };

  const allSongs = recentItems.map((i) => i.song);

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* ── Header ── */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: 0.3 }}>
            Your Library
          </Text>
        </View>

        {/* ── Library Cards Grid ── */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <LibraryCard
              icon={<HeartIcon />}
              label="Liked Songs"
              count={`${likedSongs.length} songs`}
              onPress={() => router.push("/liked-songs")}
            />
            <LibraryCard
              icon={<DownloadIcon />}
              label="Downloads"
              count={`${downloadedSongs.length} songs`}
              onPress={() => router.push("/downloads")}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <LibraryCard
              icon={<PlaylistIcon />}
              label="Playlists"
              count={`${playlists.length} playlists`}
              onPress={() => router.push("/playlists")}
            />
            <LibraryCard
              icon={<ArtistIcon />}
              label="Artists"
              count={`${followedArtists.length} artists`}
              onPress={() => router.push("/artist-following")}
            />
          </View>
        </View>

        {/* ── Recently Played ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginTop: 32,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Recently Played</Text>
          <TouchableOpacity onPress={() => router.push("/recently-played")} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Text style={{ color: "#aaa", fontSize: 13 }}>See more</Text>
            <ChevronRight />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginVertical: 30 }} />
        ) : recentItems.length === 0 ? (
          <Text style={{ color: "#555", paddingHorizontal: 20, fontSize: 13, marginTop: 8 }}>
            No recently played songs
          </Text>
        ) : (
          recentItems.map((item, i) => (
            <SongRow
              key={item.id}
              item={item}
              index={i}
              onPress={() => handleSongPress(item.song, allSongs)}
            />
          ))
        )}
      </ScrollView>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
