import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
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
import { playSong } from "../store/playerSlice";
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
const PlayIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#ffffff" d="M8 5v14l11-7z" />
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
        backgroundColor: song.album.coverUrl ? "transparent" : colorFor(index),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
        overflow: "hidden",
      }}
    >
      {song.album.coverUrl ? (
        <Image
          source={{ uri: song.album.coverUrl }}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                style={{ marginBottom: 28 }}
              >
                {featuringSongs.slice(0, 5).map((song, i) => (
                  <TouchableOpacity
                    key={song.id}
                    onPress={() => handleSongPress(song)}
                    activeOpacity={0.8}
                    style={{
                      width: width * 0.55,
                      height: 160,
                      borderRadius: 12,
                      overflow: "hidden",
                      justifyContent: "flex-end",
                      backgroundColor: colorFor(i),
                    }}
                  >
                    {song.album.coverUrl ? (
                      <Image
                        source={{ uri: song.album.coverUrl }}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", flexWrap: "wrap" }}>
                        {[colorFor(i), colorFor(i + 1), colorFor(i + 2), colorFor(i + 3)].map((c, idx) => (
                          <View key={idx} style={{ width: "50%", height: "50%", backgroundColor: c }} />
                        ))}
                      </View>
                    )}
                    <View style={{ backgroundColor: "rgba(0,0,0,0.6)", padding: 12 }}>
                      <Text style={{ color: "#ccc", fontSize: 11 }}>{song.genre.name}</Text>
                      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 }} numberOfLines={1}>
                        {song.title}
                      </Text>
                      <Text style={{ color: "#aaa", fontSize: 11 }} numberOfLines={1}>
                        {song.artist.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
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