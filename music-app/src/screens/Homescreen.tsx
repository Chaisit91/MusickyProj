import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import TopBar from "../Components/Topbar";
import BottomNav, { TabName } from "../Components/Bottomnav";
import CategoryContent, { CategoryName } from "../Components/Categorycontent";
import MiniPlayer from "../Components/MiniPlayer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutThunk } from "../store/authSlice";
import { playSong, togglePlay } from "../store/playerSlice";
import { toggleLikeSong, loadLibrary } from "../store/librarySlice";
import {
  getFeaturingSongs,
  getRecentlyPlayed,
  getGenres,
  recordPlay,
  Song,
  PlayHistoryItem,
  Genre,
} from "../api/homeApi";

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#ffffff" d="M8 5v14l11-7z" />
  </Svg>
);

const PauseIcon = ({ size = 16 }: { size?: number }) => (
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
    <Path fill="#666" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </Svg>
);

// ─── Fallback colors for cards ───────────────────────────────────────────────
const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (index: number) => FALLBACK_COLORS[index % FALLBACK_COLORS.length];

// ─── Sub-components ───────────────────────────────────────────────────────────
const AlbumCard = ({
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
    activeOpacity={0.8}
    style={{ marginRight: 12, alignItems: "center" }}
  >
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: (song.coverUrl || song.album.coverUrl) ? "transparent" : colorFor(index),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
        overflow: "hidden",
      }}
    >
      {(song.coverUrl || song.album.coverUrl) ? (
        <Image
          source={{ uri: (song.coverUrl || song.album.coverUrl)! }}
          style={{ width: 80, height: 80 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center", paddingHorizontal: 4 }}>
          {song.album.title}
        </Text>
      )}
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
      {song.title}
    </Text>
    <Text style={{ color: "#666", fontSize: 10, maxWidth: 80 }} numberOfLines={1}>
      {song.artist.name}
    </Text>
  </TouchableOpacity>
);

const GenreMixCard = ({
  genre,
  onPress,
}: {
  genre: Genre;
  onPress: () => void;
}) => {
  const accent = genre.color ?? "#e74c3c";
  const bg = "#1a1a2e";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 12, width: 110 }}>
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 10,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: accent + "55",
        }}
      >
        {genre.imageUrl ? (
          <Image source={{ uri: genre.imageUrl }} style={{ width: 110, height: 110 }} resizeMode="cover" />
        ) : (
          <>
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
                fontSize: 12,
                letterSpacing: 1,
                textAlign: "center",
                paddingHorizontal: 8,
              }}
              numberOfLines={2}
            >
              {genre.name}
            </Text>
          </>
        )}
      </View>
      <Text style={{ color: "#aaa", fontSize: 11, fontWeight: "600" }} numberOfLines={1}>
        {genre.name}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Logout Modal ─────────────────────────────────────────────────────────────
const LogoutModal = ({
  visible,
  username,
  email,
  onClose,
  onLogout,
}: {
  visible: boolean;
  username: string;
  email: string;
  onClose: () => void;
  onLogout: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <Pressable
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
      onPress={onClose}
    >
      <Pressable
        style={{
          backgroundColor: "#1a1a1a",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 24,
          paddingBottom: 40,
        }}
        onPress={() => {}}
      >
        <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#5b4fcf",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}>
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{username}</Text>
          <Text style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{email}</Text>
        </View>
        <View style={{ height: 1, backgroundColor: "#2a2a2a", marginVertical: 16 }} />
        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#2a2a2a",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path
              fill="#ff4444"
              d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
            />
          </Svg>
          <Text style={{ color: "#ff4444", fontWeight: "600", fontSize: 15 }}>Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ alignItems: "center", marginTop: 12, paddingVertical: 10 }}>
          <Text style={{ color: "#666", fontSize: 14 }}>Cancel</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Featured Songs Modal ─────────────────────────────────────────────────────
const FeaturedSongsModal = ({
  visible,
  songs,
  onClose,
  onPlay,
}: {
  visible: boolean;
  songs: Song[];
  onClose: () => void;
  onPlay: (song: Song) => void;
}) => (
  <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <Pressable
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}
      onPress={onClose}
    >
      <Pressable
        style={{
          backgroundColor: "#1a1a1a",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: 40,
          maxHeight: "80%",
        }}
        onPress={() => {}}
      >
        {/* Handle bar */}
        <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginBottom: 16 }} />

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 8 }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" style={{ marginRight: 8 }}>
            <Path fill="#f59e0b" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
          </Svg>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Featuring Today</Text>
          <Text style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>เพลงยอดนิยม</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {songs.map((song, i) => (
            <TouchableOpacity
              key={song.id}
              onPress={() => {
                onPlay(song);
                onClose();
              }}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              {/* Rank number */}
              <Text style={{ color: i < 3 ? "#f59e0b" : "#555", fontWeight: "700", fontSize: 14, width: 24 }}>
                {i + 1}
              </Text>

              {/* Cover */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  backgroundColor: colorFor(i),
                  marginRight: 12,
                  overflow: "hidden",
                }}
              >
                {(song.coverUrl || song.album.coverUrl) ? (
                  <Image
                    source={{ uri: (song.coverUrl || song.album.coverUrl)! }}
                    style={{ width: 52, height: 52 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700", textAlign: "center", paddingHorizontal: 4 }}>
                      {song.album.title}
                    </Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                  {song.artist.name} · {song.genre.name}
                </Text>
              </View>

              {/* Play button */}
              <View
                style={{
                  backgroundColor: "#5b4fcf",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <PlayIcon />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  onSeeMore,
}: {
  title: string;
  onSeeMore?: () => void;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 12,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{title}</Text>
    {onSeeMore && (
      <TouchableOpacity onPress={onSeeMore} activeOpacity={0.7}>
        <Text style={{ color: "#aaa", fontSize: 13 }}>See more</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Featuring Card (playlist-style) ─────────────────────────────────────────
const FeaturingCard = ({
  songs,
  onSongPress,
  onSeeAll,
}: {
  songs: Song[];
  onSongPress: (song: Song) => void;
  onSeeAll: () => void;
}) => {
  const dispatch = useAppDispatch();
  const currentSong = useAppSelector((s) => s.player.currentSong);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);

  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const featured = songs[0];
  const liked = likedSongs.some((s) => s.id === featured.id);
  const listSongs = songs.slice(1, 5);
  const coverUri = featured.coverUrl || featured.album.coverUrl;
  const isFeaturedPlaying = currentSong?.id === featured.id && isPlaying;

  const handleFeaturedPlay = () => {
    if (currentSong?.id === featured.id) {
      dispatch(togglePlay());
    } else {
      onSongPress(featured);
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
      {/* ── Featured row (top song) ── */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 14 }}>
        {/* Cover */}
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: colorFor(0),
          }}
        >
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={{ width: 88, height: 88 }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700", textAlign: "center", padding: 4 }}>
                {featured.album.title}
              </Text>
            </View>
          )}
        </View>

        {/* Info + actions */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 }} numberOfLines={1}>
            {featured.title}
          </Text>
          <Text style={{ color: "#aaa", fontSize: 12, marginTop: 3 }} numberOfLines={1}>
            {songs.length} songs
          </Text>
          {/* action row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 }}>
            <TouchableOpacity onPress={() => dispatch(toggleLikeSong(featured))} activeOpacity={0.7}>
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
              {isFeaturedPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
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
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }} numberOfLines={1}>{song.title}</Text>
            <Text style={{ color: "#666", fontSize: 11, marginTop: 2 }} numberOfLines={1}>{song.artist.name}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MoreIcon />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* ── See All ── */}
      <View style={{ alignItems: "flex-end", paddingHorizontal: 16, paddingVertical: 14 }}>
        <TouchableOpacity
          onPress={onSeeAll}
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

// ─── Category Pills ───────────────────────────────────────────────────────────
// Defined outside component so it's stable
const CATEGORIES: CategoryName[] = ["For you", "Relax", "Workout", "Travel", "Party"];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const logout = () => dispatch(logoutThunk());

  const [activeCategory, setActiveCategory] = useState<CategoryName>("For you");
  const [activeTab, setActiveTab] = useState<TabName>("Home");
  const [showLogout, setShowLogout] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

  // "For you" data
  const [featuringSongs, setFeaturingSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayHistoryItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [loadingFeaturing, setLoadingFeaturing] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStaticData = useCallback(async () => {
    try {
      const [songs, genreList] = await Promise.allSettled([
        getFeaturingSongs(),
        getGenres(),
      ]);
      if (songs.status === "fulfilled") setFeaturingSongs(songs.value);
      if (genreList.status === "fulfilled") setGenres(genreList.value);
    } finally {
      setLoadingFeaturing(false);
      setLoadingGenres(false);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const history = await getRecentlyPlayed(5);
      setRecentlyPlayed(history);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    dispatch(loadLibrary());
    loadStaticData();
  }, [loadStaticData]);

  useFocusEffect(
    useCallback(() => {
      loadRecent();
    }, [loadRecent])
  );

  const loadData = useCallback(async () => {
    await Promise.allSettled([loadStaticData(), loadRecent()]);
  }, [loadStaticData, loadRecent]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSongPress = async (song: Song) => {
    dispatch(playSong({ song, queue: featuringSongs.length > 0 ? featuringSongs : [song] }));
    try {
      await recordPlay(song.id);
      const updated = await getRecentlyPlayed(5);
      setRecentlyPlayed(updated);
    } catch {
      // silent fail
    }
  };


  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Search") router.push("/search");
    if (tab === "Your Library") router.push("/your-library");
  };

  // ── Determine if we show "For you" or a mood category ─────────────────────
  const isForYou = activeCategory === "For you";

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* ── TopBar ── */}
        <View style={{ paddingTop: 36 }}>
          <TopBar
            username={user?.name ?? ""}
            onPremiumPress={() => {}}
            onBellPress={() => {}}
            onAvatarPress={() => setShowLogout(true)}
          />
        </View>

        {/* ── Category Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 16 }}
        >
          {CATEGORIES.map((cat) => (
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

        {/* ════════════════════════════════════════════════════════════════════
            "FOR YOU" content  (original home content)
        ════════════════════════════════════════════════════════════════════ */}
        {isForYou ? (
          <>
            {/* ── Featuring Today ── */}
            <SectionHeader title="Featuring Today" />
            {loadingFeaturing ? (
              <ActivityIndicator color="#fff" style={{ marginBottom: 28 }} />
            ) : featuringSongs.length === 0 ? (
              <Text style={{ color: "#555", paddingHorizontal: 20, marginBottom: 28, fontSize: 13 }}>
                No songs available yet
              </Text>
            ) : (
              <FeaturingCard
                songs={featuringSongs}
                onSongPress={handleSongPress}
                onSeeAll={() => setShowFeatured(true)}
              />
            )}

            {/* ── Recently Played ── */}
            <SectionHeader
              title="Recently Played"
              onSeeMore={() => router.push("/recently-played")}
            />
            {loadingRecent ? (
              <ActivityIndicator color="#fff" style={{ marginBottom: 28 }} />
            ) : recentlyPlayed.length === 0 ? (
              <Text style={{ color: "#555", paddingHorizontal: 20, marginBottom: 28, fontSize: 13 }}>
                Play a song to see your history
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                style={{ marginBottom: 28 }}
              >
                {recentlyPlayed.map((item, i) => (
                  <AlbumCard
                    key={item.id}
                    song={item.song}
                    index={i}
                    onPress={() => handleSongPress(item.song)}
                  />
                ))}
              </ScrollView>
            )}

            {/* ── Mixes For You (Genres) ── */}
            <SectionHeader title="Mixes for you" />
            {loadingGenres ? (
              <ActivityIndicator color="#fff" style={{ marginBottom: 110 }} />
            ) : genres.length === 0 ? (
              <Text style={{ color: "#555", paddingHorizontal: 20, marginBottom: 110, fontSize: 13 }}>
                No genres available yet
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                style={{ marginBottom: 110 }}
              >
                {genres.map((genre) => (
                  <GenreMixCard
                    key={genre.id}
                    genre={genre}
                    onPress={() => {}}
                  />
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          /* ════════════════════════════════════════════════════════════════════
              MOOD categories: Relax / Workout / Travel / Party
          ════════════════════════════════════════════════════════════════════ */
          <View style={{ paddingBottom: 110 }}>
            <CategoryContent
              category={activeCategory}
              onSongPress={handleSongPress}
            />
          </View>
        )}
      </ScrollView>

      {/* ── MiniPlayer ── */}
      <MiniPlayer />

      {/* ── BottomNav ── */}
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />

      {/* ── Featured Songs Modal ── */}
      <FeaturedSongsModal
        visible={showFeatured}
        songs={featuringSongs}
        onClose={() => setShowFeatured(false)}
        onPlay={handleSongPress}
      />

      {/* ── Logout Modal ── */}
      <LogoutModal
        visible={showLogout}
        username={user?.name ?? ""}
        email={user?.email ?? ""}
        onClose={() => setShowLogout(false)}
        onLogout={handleLogout}
      />
    </View>
  );
}