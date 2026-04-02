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
  Dimensions,
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
import { playSong } from "../store/playerSlice";
import { loadLibrary } from "../store/librarySlice";
import {
  getFeaturingSongs,
  getRecentlyPlayed,
  getGenres,
  recordPlay,
  Song,
  PlayHistoryItem,
  Genre,
} from "../api/homeApi";

const { width } = Dimensions.get("window");

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlayIcon = ({ size = 14, color = "#fff" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M8 5v14l11-7z" />
  </Svg>
);

// ─── Fallback colors ──────────────────────────────────────────────────────────

const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];

// ─── Featuring Banner Card ────────────────────────────────────────────────────

const BANNER_W = width - 72;

const FeaturingBannerCard = ({
  title,
  subtitle,
  songs,
  onPress,
}: {
  title: string;
  subtitle: string;
  songs: Song[];
  onPress: () => void;
}) => {
  const covers = songs.slice(0, 6).map((s) => s.coverUrl ?? null);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: BANNER_W,
        height: 170,
        borderRadius: 14,
        overflow: "hidden",
        marginRight: 14,
        backgroundColor: "#1a1a2e",
      }}
    >
      {/* Mosaic: 3 columns × 2 rows */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {[0, 1, 2].map((col) => (
          <View key={col} style={{ flex: 1, flexDirection: "column" }}>
            {[0, 1].map((row) => {
              const idx = col * 2 + row;
              const cover = covers[idx];
              return (
                <View key={row} style={{ flex: 1, backgroundColor: colorFor(idx) }}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Gradient overlay */}
      <View
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 110,
          backgroundColor: "rgba(0,0,0,0.68)",
        }}
      />

      {/* Text */}
      <View style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
        <Text style={{ color: "#aaa", fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginBottom: 3 }}>
          {subtitle.toUpperCase()}
        </Text>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 0.4 }} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Recently Played Card ─────────────────────────────────────────────────────

const RecentCard = ({
  song,
  index,
  onPress,
}: {
  song: Song;
  index: number;
  onPress: () => void;
}) => {
  const cover = song.coverUrl;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ marginRight: 14, width: 100 }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: colorFor(index),
          marginBottom: 7,
        }}
      >
        {cover ? (
          <Image source={{ uri: cover }} style={{ width: 100, height: 100 }} resizeMode="cover" />
        ) : null}
        {/* Play overlay */}
        <View
          style={{
            position: "absolute", bottom: 6, right: 6,
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: "rgba(0,0,0,0.72)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <PlayIcon size={12} />
        </View>
      </View>
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }} numberOfLines={1}>
        {song.title}
      </Text>
      <Text style={{ color: "#888", fontSize: 10, marginTop: 2 }} numberOfLines={1}>
        {song.artist.name}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Mix Card (Mixes for you) ─────────────────────────────────────────────────

const MixCard = ({
  genre,
  index,
  coverSongs,
  onPress,
}: {
  genre: Genre;
  index: number;
  coverSongs: Song[];
  onPress: () => void;
}) => {
  const covers = coverSongs.slice(0, 4).map((s) => s.coverUrl ?? null);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ marginRight: 14, width: 140 }}
    >
      <View
        style={{
          width: 140,
          height: 140,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: colorFor(index),
          marginBottom: 8,
        }}
      >
        {genre.imageUrl ? (
          <Image source={{ uri: genre.imageUrl }} style={{ width: 140, height: 140 }} resizeMode="cover" />
        ) : (
          /* 2×2 mosaic */
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ width: 70, height: 70, backgroundColor: colorFor(index + i + 1) }}>
                {covers[i] ? (
                  <Image source={{ uri: covers[i]! }} style={{ width: 70, height: 70 }} resizeMode="cover" />
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Gradient overlay */}
        <View
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
            backgroundColor: "rgba(0,0,0,0.52)",
          }}
        />

        {/* Mix label */}
        <View style={{ position: "absolute", bottom: 9, left: 10 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
            Mix {index + 1}
          </Text>
        </View>
      </View>

      <Text style={{ color: "#aaa", fontSize: 10, fontWeight: "500" }} numberOfLines={1}>
        {genre.name}
      </Text>
    </TouchableOpacity>
  );
};

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
      marginBottom: 14,
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
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: "#5b4fcf",
              alignItems: "center", justifyContent: "center", marginBottom: 12,
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
            backgroundColor: "#2a2a2a", borderRadius: 12,
            paddingVertical: 14, alignItems: "center",
            flexDirection: "row", justifyContent: "center", gap: 8,
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path fill="#ff4444" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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
        <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginBottom: 16 }} />
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Featuring Today</Text>
          <Text style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>เพลงยอดนิยม</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {songs.map((song, i) => (
            <TouchableOpacity
              key={song.id}
              onPress={() => { onPlay(song); onClose(); }}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 }}
            >
              <Text style={{ color: i < 3 ? "#f59e0b" : "#555", fontWeight: "700", fontSize: 14, width: 24 }}>
                {i + 1}
              </Text>
              <View style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: colorFor(i), marginRight: 12, overflow: "hidden" }}>
                {song.coverUrl ? (
                  <Image source={{ uri: song.coverUrl }} style={{ width: 52, height: 52 }} resizeMode="cover" />
                ) : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }} numberOfLines={1}>{song.title}</Text>
                <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }} numberOfLines={1}>{song.artist.name}</Text>
              </View>
              <View style={{ backgroundColor: "#5b4fcf", borderRadius: 20, padding: 8 }}>
                <PlayIcon />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES: CategoryName[] = ["For you", "Relax", "Workout", "Travel", "Party"];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [activeCategory, setActiveCategory] = useState<CategoryName>("For you");
  const [activeTab, setActiveTab] = useState<TabName>("Home");
  const [showLogout, setShowLogout] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

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
      const history = await getRecentlyPlayed(6);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([loadStaticData(), loadRecent()]);
    setRefreshing(false);
  };

  const handleSongPress = async (song: Song) => {
    dispatch(playSong({ song, queue: featuringSongs.length > 0 ? featuringSongs : [song] }));
    try {
      await recordPlay(song.id);
      const updated = await getRecentlyPlayed(6);
      setRecentlyPlayed(updated);
    } catch { /* silent */ }
  };

  const handleLogout = async () => {
    setShowLogout(false);
    await dispatch(logoutThunk());
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Search") router.push("/search");
    if (tab === "Your Library") router.push("/your-library");
  };

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
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 20 }}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
              >
                {/* Main banner */}
                <FeaturingBannerCard
                  title="Featured Songs"
                  subtitle="New"
                  songs={featuringSongs}
                  onPress={() => setShowFeatured(true)}
                />
                {/* Extra banners from genres */}
                {genres.slice(0, 3).map((genre, gi) => (
                  <FeaturingBannerCard
                    key={genre.id}
                    title={genre.name}
                    subtitle="Trending"
                    songs={featuringSongs.slice(gi * 2, gi * 2 + 6)}
                    onPress={() =>
                      router.push({
                        pathname: "/genre/[id]",
                        params: {
                          id: genre.id,
                          name: encodeURIComponent(genre.name),
                          color: encodeURIComponent(genre.color ?? "#1a1a2e"),
                          imageUrl: encodeURIComponent(genre.imageUrl ?? ""),
                        },
                      })
                    }
                  />
                ))}
              </ScrollView>
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
                  <RecentCard
                    key={item.id}
                    song={item.song}
                    index={i}
                    onPress={() => handleSongPress(item.song)}
                  />
                ))}
              </ScrollView>
            )}

            {/* ── Mixes for you ── */}
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
                {genres.map((genre, gi) => (
                  <MixCard
                    key={genre.id}
                    genre={genre}
                    index={gi}
                    coverSongs={featuringSongs.slice((gi * 4) % Math.max(featuringSongs.length, 1))}
                    onPress={() =>
                      router.push({
                        pathname: "/genre/[id]",
                        params: {
                          id: genre.id,
                          name: encodeURIComponent(genre.name),
                          color: encodeURIComponent(genre.color ?? "#1a1a2e"),
                          imageUrl: encodeURIComponent(genre.imageUrl ?? ""),
                        },
                      })
                    }
                  />
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <View style={{ paddingBottom: 110 }}>
            <CategoryContent category={activeCategory} onSongPress={handleSongPress} />
          </View>
        )}
      </ScrollView>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />

      <FeaturedSongsModal
        visible={showFeatured}
        songs={featuringSongs}
        onClose={() => setShowFeatured(false)}
        onPlay={handleSongPress}
      />

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
