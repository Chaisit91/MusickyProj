import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { getFeaturingSongs, Song } from "../api/homeApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { togglePlay } from "../store/playerSlice";

const { width } = Dimensions.get("window");

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#ffffff" d="M8 5v14l11-7z" />
  </Svg>
);

const PauseIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#ffffff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill={filled ? "#e74c3c" : "none"}
      stroke={filled ? "#e74c3c" : "#888"}
      strokeWidth={1.8}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
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

// ─── Config per category ──────────────────────────────────────────────────────

export type CategoryName = "For you" | "Relax" | "Workout" | "Travel" | "Party";

interface CategoryConfig {
  headline: string;
  subline: string;
  mood: string;
  accentColor: string;
  bgGradientColors: string[];
  filterKeyword: string;
  playlistTitle: string;
  playlistCount: string;
}

const CATEGORY_CONFIG: Record<CategoryName, CategoryConfig> = {
  "For you": {
    headline: "Your Daily Mix",
    subline: "Handpicked just for you",
    mood: "FOR YOU",
    accentColor: "#7c6af7",
    bgGradientColors: ["#1a1a3e", "#0d0d1a"],
    filterKeyword: "",
    playlistTitle: "Daily Mix",
    playlistCount: "30 songs",
  },
  Relax: {
    headline: "Today's Refreshing Song-\nRecommendations",
    subline: "Calm your mind, ease into the moment",
    mood: "FOR RELAXING",
    accentColor: "#4a9eff",
    bgGradientColors: ["#0d1f3c", "#0a1628"],
    filterKeyword: "chill",
    playlistTitle: "Peace",
    playlistCount: "22 songs",
  },
  Workout: {
    headline: "Power Up Your\nTraining Session",
    subline: "High-energy tracks to push your limits",
    mood: "FOR WORKOUT",
    accentColor: "#ff5f3b",
    bgGradientColors: ["#2a0a00", "#1a0500"],
    filterKeyword: "rock",
    playlistTitle: "Burn",
    playlistCount: "18 songs",
  },
  Travel: {
    headline: "Soundtrack for\nYour Journey",
    subline: "Music that moves as you move",
    mood: "FOR TRAVEL",
    accentColor: "#00c896",
    bgGradientColors: ["#001f1a", "#00120f"],
    filterKeyword: "pop",
    playlistTitle: "Wanderlust",
    playlistCount: "25 songs",
  },
  Party: {
    headline: "Get the Party\nStarted Now",
    subline: "Drop the beat and light it up",
    mood: "FOR PARTY",
    accentColor: "#f7c948",
    bgGradientColors: ["#1f1500", "#120d00"],
    filterKeyword: "dance",
    playlistTitle: "Vibe Check",
    playlistCount: "40 songs",
  },
};

// ─── Fallback cover colors ────────────────────────────────────────────────────

const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];

// ─── Featured Playlist Card (big card at top) ─────────────────────────────────

const FeaturedPlaylistCard = ({
  songs,
  onSongPress,
}: {
  songs: Song[];
  config?: CategoryConfig;
  onSongPress: (song: Song) => void;
}) => {
  const dispatch = useAppDispatch();
  const currentSong = useAppSelector((s) => s.player.currentSong);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);

  const [liked, setLiked] = useState(false);
  const featuredSong = songs[0];
  const listSongs = songs.slice(1, 5);
  const coverUri = featuredSong.coverUrl || featuredSong.album.coverUrl;
  const isFeaturedPlaying = currentSong?.id === featuredSong.id && isPlaying;

  const handleFeaturedPlay = () => {
    if (currentSong?.id === featuredSong.id) {
      dispatch(togglePlay());
    } else {
      onSongPress(featuredSong);
    }
  };

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 28,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#181825",
        borderWidth: 1,
        borderColor: "#ffffff14",
      }}
    >
      {/* ── Featured row ── */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 14 }}>
        {/* Cover */}
        <View style={{ width: 88, height: 88, borderRadius: 10, overflow: "hidden", backgroundColor: colorFor(0) }}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={{ width: 88, height: 88 }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700", textAlign: "center", padding: 4 }}>
                {featuredSong.album.title}
              </Text>
            </View>
          )}
        </View>

        {/* Info + actions */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 }} numberOfLines={1}>
            {featuredSong.title}
          </Text>
          <Text style={{ color: "#aaa", fontSize: 12, marginTop: 3 }} numberOfLines={1}>
            {songs.length} songs
          </Text>
          {/* action row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 }}>
            <TouchableOpacity onPress={() => setLiked((v) => !v)} activeOpacity={0.7}>
              <HeartIcon filled={liked} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <MoreIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFeaturedPlay}
              activeOpacity={0.85}
              style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: "#2e2e3e",
                alignItems: "center", justifyContent: "center",
                borderWidth: 1,
                borderColor: "#ffffff22",
              }}
            >
              {isFeaturedPlaying ? <PauseIcon size={18} /> : <PlayIcon size={20} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#ffffff10", marginHorizontal: 16 }} />

      {/* ── Song list ── */}
      {listSongs.map((song, i) => (
        <TouchableOpacity
          key={song.id}
          onPress={() => onSongPress(song)}
          activeOpacity={0.75}
          style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: colorFor(i + 1) }}>
            {(song.coverUrl || song.album.coverUrl) ? (
              <Image
                source={{ uri: (song.coverUrl || song.album.coverUrl)! }}
                style={{ width: 44, height: 44 }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#ffffff60", fontSize: 14 }}>♪</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={{ color: "#666", fontSize: 11, marginTop: 2 }} numberOfLines={1}>
              {song.artist.name}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MoreIcon />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* ── See All ── */}
      <View style={{ alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 14 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20,
            borderWidth: 1, borderColor: "#ffffff28",
            backgroundColor: "#ffffff0c",
          }}
        >
          <Text style={{ color: "#ccc", fontSize: 13, fontWeight: "500" }}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Horizontal Song Strip ────────────────────────────────────────────────────

const SongStrip = ({
  songs,
  config,
  onSongPress,
}: {
  songs: Song[];
  config: CategoryConfig;
  onSongPress: (song: Song) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
    style={{ marginBottom: 28 }}
  >
    {songs.slice(0, 6).map((song, i) => (
      <TouchableOpacity
        key={song.id}
        onPress={() => onSongPress(song)}
        activeOpacity={0.8}
        style={{
          width: width * 0.42,
          height: 130,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: colorFor(i + 5),
          justifyContent: "flex-end",
        }}
      >
        {song.album.coverUrl ? (
          <Image
            source={{ uri: song.album.coverUrl }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            resizeMode="cover"
          />
        ) : null}
        {/* overlay */}
        <View style={{ backgroundColor: "rgba(0,0,0,0.55)", padding: 10 }}>
          <Text style={{ color: config.accentColor, fontSize: 9, fontWeight: "700", letterSpacing: 1, marginBottom: 2 }}>
            {song.genre?.name?.toUpperCase()}
          </Text>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={{ color: "#aaa", fontSize: 10 }} numberOfLines={1}>
            {song.artist.name}
          </Text>
        </View>
        {/* play badge */}
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: config.accentColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlayIcon size={12} />
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, accent }: { title: string; accent: string }) => (
  <View style={{ paddingHorizontal: 20, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
    <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: accent }} />
    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>{title}</Text>
  </View>
);

// ─── Mood Tag ─────────────────────────────────────────────────────────────────

const MoodTag = ({ label, accent }: { label: string; accent: string }) => (
  <View
    style={{
      paddingHorizontal: 20,
      marginBottom: 6,
    }}
  >
    <Text style={{ color: accent, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 }}>{label}</Text>
  </View>
);

// ─── Main CategoryContent ─────────────────────────────────────────────────────

interface CategoryContentProps {
  category: CategoryName;
  onSongPress: (song: Song) => void;
}

export default function CategoryContent({ category, onSongPress }: CategoryContentProps) {
  const config = CATEGORY_CONFIG[category];
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getFeaturingSongs();
      // Shuffle slightly differently per category using category string as seed offset
      const offset = config.playlistTitle.length;
      const shifted = [...all.slice(offset % all.length), ...all.slice(0, offset % all.length)];
      setSongs(shifted.length > 0 ? shifted : all);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  if (loading) {
    return (
      <View style={{ paddingVertical: 40, alignItems: "center" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (songs.length === 0) {
    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
        <Text style={{ color: "#555", fontSize: 13 }}>No songs available for this category yet.</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Headline */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 30 }}>
          {config.headline}
        </Text>
        <Text style={{ color: "#666", fontSize: 13, marginTop: 6 }}>{config.subline}</Text>
      </View>

      {/* Featured card */}
      <MoodTag label={config.mood} accent={config.accentColor} />
      <FeaturedPlaylistCard songs={songs} config={config} onSongPress={onSongPress} />

      {/* More from this mood */}
      <SectionHeader title="More like this" accent={config.accentColor} />
      <SongStrip songs={[...songs].reverse()} config={config} onSongPress={onSongPress} />

      {/* Mixes for you label at bottom */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={{ color: config.accentColor, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 }}>
          {config.mood}
        </Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 }}>
          Mixes for you
        </Text>
      </View>
    </View>
  );
}