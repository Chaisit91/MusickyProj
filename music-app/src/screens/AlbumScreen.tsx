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
import { getAlbumSongs } from "../api/detailApi";
import { useAppDispatch } from "../store/hooks";
import { playSong } from "../store/playerSlice";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 300;

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

const PlayIcon = ({ color = "#000", size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M8 5v14l11-7z" />
  </Svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={filled ? "#e74c3c" : "none"}
      stroke={filled ? "#e74c3c" : "#aaa"}
      strokeWidth={1.8}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#aaa"
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"
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

// ─── Song Row ─────────────────────────────────────────────────────────────────

const SongRow = ({
  song,
  index,
  showIndex,
  onPress,
}: {
  song: Song;
  index: number;
  showIndex: boolean;
  onPress: () => void;
}) => (
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
    {showIndex ? (
      <Text style={{ color: "#555", fontSize: 14, width: 24, textAlign: "center" }}>
        {index + 1}
      </Text>
    ) : null}

    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: colorFor(index),
      }}
    >
      {song.album.coverUrl ? (
        <Image source={{ uri: song.album.coverUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ffffff60", fontSize: 16 }}>♪</Text>
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

// ─── Main AlbumScreen ─────────────────────────────────────────────────────────

export default function AlbumScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    coverUrl: string;
    type: string; // "album" | "playlist"
    artistName: string;
  }>();

  const albumId = params.id;
  const dispatch = useAppDispatch();
  const title = decodeURIComponent(params.title ?? "");
  const coverUrl = params.coverUrl ? decodeURIComponent(params.coverUrl) : null;
  const type = (params.type ?? "album") as "album" | "playlist";
  const artistName = params.artistName ? decodeURIComponent(params.artistName) : "";

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    getAlbumSongs(albumId)
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [albumId]);

  const handleSongPress = async (song: Song) => {
    dispatch(playSong({ song, queue: songs.length > 0 ? songs : [song] }));
    try {
      await recordPlay(song.id);
    } catch {
      // silent
    }
  };

  const typeLabel = type === "playlist" ? "Playlist" : "Album";
  const showIndex = type === "album";

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={{ width, height: HERO_HEIGHT, position: "relative" }}>
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={{ width, height: HERO_HEIGHT }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width,
                height: HERO_HEIGHT,
                backgroundColor: "#1a1a3e",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#ffffff20", fontSize: 64, fontWeight: "900" }}>♪</Text>
            </View>
          )}

          {/* Dark overlay */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: HERO_HEIGHT * 0.65,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{
              position: "absolute",
              top: 52,
              left: 16,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BackIcon />
          </TouchableOpacity>

          {/* Title + type overlay */}
          <View style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
            <Text style={{ color: "#ffffff80", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 }}>
              {typeLabel.toUpperCase()}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 24,
                fontWeight: "900",
                letterSpacing: 0.3,
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
              numberOfLines={2}
            >
              {title}
            </Text>
            {artistName ? (
              <Text style={{ color: "#ffffff80", fontSize: 13, marginTop: 4 }} numberOfLines={1}>
                {artistName}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Stats + Actions ── */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          {/* Stats */}
          <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>
            {songs.length > 0
              ? `${(songs.length * 12000).toLocaleString()} likes • ${songs.length} songs`
              : ""}
          </Text>

          {/* Action row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity onPress={() => setLiked((v) => !v)} activeOpacity={0.7} style={{ padding: 4 }}>
              <HeartIcon filled={liked} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={{ padding: 4 }}>
              <ShareIcon />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={{ padding: 4 }}>
              <MoreIcon />
            </TouchableOpacity>

            {/* Play button pushed right */}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={() => songs[0] && handleSongPress(songs[0])}
                activeOpacity={0.85}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayIcon color="#000" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Song List ── */}
        <View style={{ height: 1, backgroundColor: "#ffffff10", marginHorizontal: 20, marginBottom: 8 }} />

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginVertical: 30 }} />
        ) : songs.length === 0 ? (
          <Text style={{ color: "#555", paddingHorizontal: 20, fontSize: 13, marginTop: 20 }}>
            No songs available
          </Text>
        ) : (
          songs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              showIndex={showIndex}
              onPress={() => handleSongPress(song)}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
