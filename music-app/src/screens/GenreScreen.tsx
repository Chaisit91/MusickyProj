import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { recordPlay, Song } from "../api/homeApi";
import { getGenreSongs } from "../api/detailApi";
import { useAppDispatch } from "../store/hooks";
import { playSong } from "../store/playerSlice";
import MiniPlayer from "../Components/MiniPlayer";
import BottomNav, { TabName } from "../Components/Bottomnav";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 220;

const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#fff" d="M8 5v14l11-7z" />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Circle cx={5} cy={12} r={2} fill="#666" />
    <Circle cx={12} cy={12} r={2} fill="#666" />
    <Circle cx={19} cy={12} r={2} fill="#666" />
  </Svg>
);

// ─── Song Row ─────────────────────────────────────────────────────────────────

const SongRow = ({
  song,
  index,
  onPress,
}: {
  song: Song;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, gap: 12 }}
  >
    <View style={{ width: 48, height: 48, borderRadius: 6, overflow: "hidden", backgroundColor: colorFor(index) }}>
      {(song.coverUrl || song.album.coverUrl) ? (
        <Image source={{ uri: (song.coverUrl || song.album.coverUrl)! }} style={{ width: 48, height: 48 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ffffff60", fontSize: 16 }}>♪</Text>
        </View>
      )}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>{song.title}</Text>
      <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
        {song.artist.name} · {song.album.title}
      </Text>
    </View>
    <TouchableOpacity activeOpacity={0.7} style={{ padding: 6 }}>
      <MoreIcon />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Main GenreScreen ─────────────────────────────────────────────────────────

export default function GenreScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    color: string;
    imageUrl: string;
  }>();

  const genreId = params.id;
  const genreName = decodeURIComponent(params.name ?? "");
  const genreColor = params.color ? decodeURIComponent(params.color) : "#1a1a2e";
  const genreImageUrl = params.imageUrl ? decodeURIComponent(params.imageUrl) : null;

  const dispatch = useAppDispatch();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("Search");

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Search") router.replace("/search");
  };

  useEffect(() => {
    getGenreSongs(genreId)
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [genreId]);

  const handleSongPress = async (song: Song) => {
    dispatch(playSong({ song, queue: songs.length > 0 ? songs : [song] }));
    try {
      await recordPlay(song.id);
    } catch {
      // silent
    }
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    dispatch(playSong({ song: songs[0], queue: songs }));
    recordPlay(songs[0].id).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={{ width, height: HERO_HEIGHT, position: "relative" }}>
          {genreImageUrl ? (
            <Image source={{ uri: genreImageUrl }} style={{ width, height: HERO_HEIGHT }} resizeMode="cover" />
          ) : (
            <View style={{ width, height: HERO_HEIGHT, backgroundColor: genreColor, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#ffffff20", fontSize: 72, fontWeight: "900" }}>
                {genreName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: HERO_HEIGHT * 0.6,
              backgroundColor: "rgba(0,0,0,0.55)",
            }}
          />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{
              position: "absolute", top: 52, left: 16,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <BackIcon />
          </TouchableOpacity>

          {/* Genre name */}
          <View style={{ position: "absolute", bottom: 20, left: 20 }}>
            <Text
              style={{
                color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: 0.5,
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              {genreName.toUpperCase()}
            </Text>
            <Text style={{ color: "#ffffff90", fontSize: 12, marginTop: 4, letterSpacing: 0.5 }}>
              Genre
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>
            {loading ? "" : `${songs.length} songs`}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={handlePlayAll}
              activeOpacity={0.85}
              style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                paddingHorizontal: 28, paddingVertical: 10, borderRadius: 24,
                backgroundColor: "#fff",
              }}
            >
              <PlayIcon size={18} />
              <Text style={{ color: "#000", fontSize: 14, fontWeight: "700" }}>Play all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={{ height: 1, backgroundColor: "#1e1e1e", marginTop: 8 }} />

        {/* ── Song list ── */}
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
        ) : songs.length === 0 ? (
          <Text style={{ color: "#555", paddingHorizontal: 20, marginTop: 20, fontSize: 13 }}>
            No songs in this genre yet
          </Text>
        ) : (
          songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} onPress={() => handleSongPress(song)} />
          ))
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
