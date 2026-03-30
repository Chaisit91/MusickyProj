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
import { getArtistSongs } from "../api/detailApi";
import { useAppDispatch } from "../store/hooks";
import { playSong } from "../store/playerSlice";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 280;

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
  onPress,
}: {
  song: Song;
  index: number;
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

// ─── Main ArtistScreen ────────────────────────────────────────────────────────

export default function ArtistScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    imageUrl: string;
  }>();

  const artistId = params.id;
  const artistName = decodeURIComponent(params.name ?? "");
  const artistImageUrl = params.imageUrl ? decodeURIComponent(params.imageUrl) : null;

  const dispatch = useAppDispatch();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getArtistSongs(artistId)
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [artistId]);

  const handleSongPress = async (song: Song) => {
    dispatch(playSong({ song, queue: songs.length > 0 ? songs : [song] }));
    try {
      await recordPlay(song.id);
    } catch {
      // silent
    }
  };

  const displaySongs = showAll ? songs : songs.slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero Image ── */}
        <View style={{ width, height: HERO_HEIGHT, position: "relative" }}>
          {artistImageUrl ? (
            <Image
              source={{ uri: artistImageUrl }}
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
              <Text style={{ color: "#ffffff30", fontSize: 80, fontWeight: "900" }}>
                {artistName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: HERO_HEIGHT * 0.6,
              backgroundColor: "rgba(0,0,0,0.55)",
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

          {/* Artist name + label */}
          <View style={{ position: "absolute", bottom: 20, left: 20 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "900",
                letterSpacing: 0.5,
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              {artistName.toUpperCase()}
            </Text>
            <Text style={{ color: "#ffffff90", fontSize: 12, marginTop: 4, letterSpacing: 0.5 }}>
              Artist
            </Text>
          </View>
        </View>

        {/* ── Stats + Actions ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>
            {songs.length > 0 ? `${(songs.length * 38542).toLocaleString()} monthly listeners` : ""}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {/* Follow */}
            <TouchableOpacity
              onPress={() => setFollowed((v) => !v)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: followed ? "#fff" : "#555",
                backgroundColor: followed ? "#fff" : "transparent",
              }}
            >
              <Text style={{ color: followed ? "#000" : "#fff", fontSize: 13, fontWeight: "700" }}>
                {followed ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity activeOpacity={0.7} style={{ padding: 6 }}>
              <ShareIcon />
            </TouchableOpacity>

            {/* Play — pushed to right */}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={() => songs[0] && handleSongPress(songs[0])}
                activeOpacity={0.85}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayIcon size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Popular releases ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Popular releases</Text>
          {songs.length > 6 && (
            <TouchableOpacity onPress={() => setShowAll((v) => !v)} activeOpacity={0.7}>
              <Text style={{ color: "#aaa", fontSize: 13 }}>
                {showAll ? "Show less" : "See more"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginVertical: 30 }} />
        ) : songs.length === 0 ? (
          <Text style={{ color: "#555", paddingHorizontal: 20, fontSize: 13, marginBottom: 20 }}>
            No songs available
          </Text>
        ) : (
          displaySongs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              onPress={() => handleSongPress(song)}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
