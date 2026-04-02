import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path, Circle } from "react-native-svg";
import { router } from "expo-router";
import BottomNav, { TabName } from "../Components/Bottomnav";
import MiniPlayer from "../Components/MiniPlayer";
import { Artist, Genre, Song } from "../api/homeApi";
import { getTrendingArtists, getBrowseGenres, searchAll, SearchResult } from "../api/searchApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { playSong } from "../store/playerSlice";
import { toggleLikeSong, toggleDownload } from "../store/librarySlice";
import { colorFor } from "../constants";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const STORAGE_KEY = "recent_searches";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentSearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: "song" | "album" | "artist" | "playlist";
  coverUrl: string | null;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = ({ color = "#888", size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
    />
  </Svg>
);

const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const MicIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill="#888"
      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
    />
  </Svg>
);

const PlayIcon = ({ color = "#fff" }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill={color} d="M8 5v14l11-7z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#555" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </Svg>
);

const TrendIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill={filled ? "#e84393" : "none"}
      stroke={filled ? "#e84393" : "#555"}
      strokeWidth={2}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </Svg>
);

const DownloadIcon = ({ downloaded }: { downloaded: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill={downloaded ? "#4fc3f7" : "#555"}
      d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
    />
  </Svg>
);

// ─── Recent Search Storage ────────────────────────────────────────────────────

const loadRecent = async (): Promise<RecentSearchItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecent = async (items: RecentSearchItem[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
};

export const addRecentSearch = async (item: RecentSearchItem) => {
  const existing = await loadRecent();
  const filtered = existing.filter((r) => r.id !== item.id);
  await saveRecent([item, ...filtered]);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ArtistCircle = ({
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
    style={{ alignItems: "center", marginRight: 16, width: 64 }}
  >
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: colorFor(index),
        marginBottom: 6,
      }}
    >
      {artist.imageUrl ? (
        <Image source={{ uri: artist.imageUrl }} style={{ width: 56, height: 56 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
            {artist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
    <Text style={{ color: "#ccc", fontSize: 11, textAlign: "center" }} numberOfLines={2}>
      {artist.name}
    </Text>
  </TouchableOpacity>
);

const GenreCard = ({
  genre,
  index,
  onPress,
}: {
  genre: Genre;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      width: CARD_WIDTH,
      height: 100,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: genre.color ?? colorFor(index),
      marginBottom: 12,
      justifyContent: "flex-end",
    }}
  >
    {genre.imageUrl ? (
      <Image
        source={{ uri: genre.imageUrl }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="cover"
      />
    ) : null}
    <View style={{ backgroundColor: "rgba(0,0,0,0.35)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
    <Text
      style={{
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 0.5,
        paddingHorizontal: 12,
        paddingBottom: 12,
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      }}
    >
      {genre.name.toUpperCase()}
    </Text>
  </TouchableOpacity>
);

const RecentItem = ({
  item,
  onRemove,
  onPlay,
  onRowPress,
}: {
  item: RecentSearchItem;
  onRemove: (id: string) => void;
  onPlay: (item: RecentSearchItem) => void;
  onRowPress: (item: RecentSearchItem) => void;
}) => (
  <TouchableOpacity
    onPress={() => onRowPress(item)}
    activeOpacity={0.75}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 12,
    }}
  >
    {/* Cover */}
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: item.type === "artist" ? 22 : 6,
        overflow: "hidden",
        backgroundColor: "#2a2a2a",
      }}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#555", fontSize: 18 }}>♪</Text>
        </View>
      )}
    </View>

    {/* Info */}
    <View style={{ flex: 1 }}>
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
        {item.subtitle}
      </Text>
    </View>

    {/* Play */}
    <TouchableOpacity
      onPress={() => onPlay(item)}
      activeOpacity={0.7}
      style={{ padding: 6 }}
    >
      <PlayIcon color="#888" />
    </TouchableOpacity>

    {/* Remove */}
    <TouchableOpacity
      onPress={() => onRemove(item.id)}
      activeOpacity={0.7}
      style={{ padding: 6 }}
    >
      <CloseIcon />
    </TouchableOpacity>
  </TouchableOpacity>
);

const SearchResultItem = ({
  song,
  query,
  onPress,
}: {
  song: Song;
  query: string;
  onPress: (song: Song) => void;
}) => {
  const dispatch = useAppDispatch();
  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);
  const isLiked = likedSongs.some((s) => s.id === song.id);
  const isDownloaded = downloadedSongs.some((s) => s.id === song.id);

  const lower = query.toLowerCase();
  const titleMatch = song.title.toLowerCase().includes(lower);
  const artistMatch = song.artist.name.toLowerCase().includes(lower);

  return (
    <TouchableOpacity
      onPress={() => onPress(song)}
      activeOpacity={0.8}
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
          width: 44,
          height: 44,
          borderRadius: 6,
          overflow: "hidden",
          backgroundColor: "#2a2a2a",
        }}
      >
        {song.coverUrl ? (
          <Image source={{ uri: song.coverUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#555", fontSize: 18 }}>♪</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: titleMatch ? "#fff" : "#aaa", fontSize: 14, fontWeight: titleMatch ? "700" : "400" }}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text
          style={{ color: artistMatch ? "#ccc" : "#555", fontSize: 12, marginTop: 2 }}
          numberOfLines={1}
        >
          เพลง • {song.artist.name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); dispatch(toggleLikeSong(song)); }}
        activeOpacity={0.7}
        style={{ padding: 6 }}
      >
        <HeartIcon filled={isLiked} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); dispatch(toggleDownload(song)); }}
        activeOpacity={0.7}
        style={{ padding: 6 }}
      >
        <DownloadIcon downloaded={isDownloaded} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ArtistResultItem = ({
  artist,
  index,
  onPress,
}: {
  artist: Artist;
  index: number;
  onPress: (artist: Artist) => void;
}) => (
  <TouchableOpacity
    onPress={() => onPress(artist)}
    activeOpacity={0.8}
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
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: colorFor(index),
      }}
    >
      {artist.imageUrl ? (
        <Image source={{ uri: artist.imageUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            {artist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>ศิลปิน</Text>
    </View>
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path fill="#555" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </Svg>
  </TouchableOpacity>
);

// ─── Main SearchScreen ────────────────────────────────────────────────────────

export default function SearchScreen() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("Search");

  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult>({ songs: [], artists: [] });
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load default data ────────────────────────────────────────────────────
  useEffect(() => {
    getTrendingArtists()
      .then(setArtists)
      .finally(() => setLoadingArtists(false));
    getBrowseGenres()
      .then(setGenres)
      .finally(() => setLoadingGenres(false));
    loadRecent().then(setRecentSearches);
  }, []);

  // ── Debounced search ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ songs: [], artists: [] });
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setLoadingResults(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchAll(query.trim());
        setSearchResults(results);
      } catch {
        setSearchResults({ songs: [], artists: [] });
      } finally {
        setLoadingResults(false);
      }
    }, 600);
  }, [query]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRemoveRecent = useCallback(async (id: string) => {
    const updated = recentSearches.filter((r) => r.id !== id);
    setRecentSearches(updated);
    await saveRecent(updated);
  }, [recentSearches]);

  const handleClearAll = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const navigateByType = useCallback((item: RecentSearchItem) => {
    if (item.type === "artist") {
      router.push({
        pathname: "/artist/[id]",
        params: {
          id: item.id,
          name: encodeURIComponent(item.title),
          imageUrl: item.coverUrl ? encodeURIComponent(item.coverUrl) : "",
        },
      });
    } else if (item.type === "album" || item.type === "playlist") {
      router.push({
        pathname: "/album/[id]",
        params: {
          id: item.id,
          title: encodeURIComponent(item.title),
          coverUrl: item.coverUrl ? encodeURIComponent(item.coverUrl) : "",
          type: item.type,
          artistName: encodeURIComponent(item.subtitle),
        },
      });
    }
  }, []);

  const handlePlayRecent = useCallback((item: RecentSearchItem) => {
    navigateByType(item);
  }, [navigateByType]);

  const handleSelectSong = useCallback(async (song: Song) => {
    dispatch(playSong({ song, queue: searchResults.songs.length > 0 ? searchResults.songs : [song] }));
    const item: RecentSearchItem = {
      id: song.id,
      title: song.title,
      subtitle: `Song • ${song.artist.name}`,
      type: "song",
      coverUrl: song.coverUrl,
    };
    await addRecentSearch(item);
    const updated = await loadRecent();
    setRecentSearches(updated);
    // Also add artist as a navigable recent entry
    const artistItem: RecentSearchItem = {
      id: song.artist.id,
      title: song.artist.name,
      subtitle: "Artist",
      type: "artist",
      coverUrl: song.artist.imageUrl,
    };
    await addRecentSearch(artistItem);
    const final = await loadRecent();
    setRecentSearches(final);
  }, []);

  const handleSelectArtist = useCallback(async (artist: Artist) => {
    const item: RecentSearchItem = {
      id: artist.id,
      title: artist.name,
      subtitle: "Artist",
      type: "artist",
      coverUrl: artist.imageUrl,
    };
    await addRecentSearch(item);
    const updated = await loadRecent();
    setRecentSearches(updated);
    router.push({
      pathname: "/artist/[id]",
      params: {
        id: artist.id,
        name: encodeURIComponent(artist.name),
        imageUrl: artist.imageUrl ? encodeURIComponent(artist.imageUrl) : "",
      },
    });
  }, []);

  const handleBack = () => {
    setIsFocused(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Your Library") router.replace("/your-library");
  };

  const isActive = isFocused || query.length > 0;
  const showResults = query.trim().length > 0;

  // ── Left / Right column genres for 2-col grid ────────────────────────────
  const leftGenres = genres.filter((_, i) => i % 2 === 0);
  const rightGenres = genres.filter((_, i) => i % 2 === 1);

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* ── Search Bar ── */}
      <View
        style={{
          paddingTop: 52,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {isActive ? (
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={{ padding: 4 }}>
            <BackIcon />
          </TouchableOpacity>
        ) : null}

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isActive ? "#1e1e1e" : "#1e1e1e",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 44,
            gap: 8,
            borderWidth: isActive ? 1 : 0,
            borderColor: isActive ? "#ffffff20" : "transparent",
          }}
        >
          <SearchIcon color={isActive ? "#fff" : "#888"} size={18} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            placeholder="Search songs, artist, album o..."
            placeholderTextColor="#555"
            style={{ flex: 1, color: "#fff", fontSize: 15, padding: 0 }}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            keyboardType="default"
            textContentType="none"
            importantForAutofill="no"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          )}
        </View>

        {isActive && (
          <TouchableOpacity activeOpacity={0.7} style={{ padding: 4 }}>
            <MicIcon />
          </TouchableOpacity>
        )}
      </View>

      {/* ══════════════════════════════════════════════════════════════════
          ACTIVE STATE: Recent Searches or Search Results
      ══════════════════════════════════════════════════════════════════ */}
      {isActive ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {showResults ? (
            <>
              {loadingResults ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
              ) : searchResults.songs.length === 0 && searchResults.artists.length === 0 ? (
                <Text style={{ color: "#555", paddingHorizontal: 20, marginTop: 20, fontSize: 13 }}>
                  ไม่พบผลลัพธ์สำหรับ "{query}"
                </Text>
              ) : (
                <>
                  {/* ── Artists section ── */}
                  {searchResults.artists.length > 0 && (
                    <>
                      <Text style={{ color: "#aaa", fontSize: 12, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 20, marginTop: 16, marginBottom: 6 }}>
                        ศิลปิน
                      </Text>
                      {searchResults.artists.map((artist, i) => (
                        <ArtistResultItem
                          key={artist.id}
                          artist={artist}
                          index={i}
                          onPress={handleSelectArtist}
                        />
                      ))}
                    </>
                  )}

                  {/* ── Songs section ── */}
                  {searchResults.songs.length > 0 && (
                    <>
                      <Text style={{ color: "#aaa", fontSize: 12, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 20, marginTop: 16, marginBottom: 6 }}>
                        เพลง
                      </Text>
                      {searchResults.songs.map((song) => (
                        <SearchResultItem
                          key={song.id}
                          song={song}
                          query={query}
                          onPress={handleSelectSong}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* Recent searches header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  Recent searches
                </Text>
              </View>

              {recentSearches.length === 0 ? (
                <Text style={{ color: "#555", paddingHorizontal: 20, fontSize: 13 }}>
                  No recent searches
                </Text>
              ) : (
                <>
                  {recentSearches.map((item) => (
                    <RecentItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveRecent}
                      onPlay={handlePlayRecent}
                      onRowPress={navigateByType}
                    />
                  ))}
                  <TouchableOpacity
                    onPress={handleClearAll}
                    activeOpacity={0.7}
                    style={{ alignItems: "flex-end", paddingHorizontal: 20, paddingVertical: 16 }}
                  >
                    <Text style={{ color: "#666", fontSize: 13 }}>Clear history</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
          <View style={{ height: 110 }} />
        </ScrollView>
      ) : (
        /* ════════════════════════════════════════════════════════════════
            DEFAULT STATE: Trending Artists + Browse Genres
        ════════════════════════════════════════════════════════════════ */
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* ── Trending Artists ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TrendIcon />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Trending artists</Text>
          </View>
          {loadingArtists ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 }}
            >
              {artists.map((artist, i) => (
                <ArtistCircle
                  key={artist.id}
                  artist={artist}
                  index={i}
                  onPress={() => handleSelectArtist(artist)}
                />
              ))}
            </ScrollView>
          )}

          {/* ── Browse ── */}
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", paddingHorizontal: 20, marginBottom: 14 }}>
            Browse
          </Text>
          {loadingGenres ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />
          ) : (
            <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 12 }}>
              {/* Left column */}
              <View style={{ flex: 1 }}>
                {leftGenres.map((genre, i) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    index={i * 2}
                    onPress={() => router.push({
                      pathname: "/genre/[id]",
                      params: {
                        id: genre.id,
                        name: encodeURIComponent(genre.name),
                        color: encodeURIComponent(genre.color ?? ""),
                        imageUrl: genre.imageUrl ? encodeURIComponent(genre.imageUrl) : "",
                      },
                    })}
                  />
                ))}
              </View>
              {/* Right column */}
              <View style={{ flex: 1 }}>
                {rightGenres.map((genre, i) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    index={i * 2 + 1}
                    onPress={() => router.push({
                      pathname: "/genre/[id]",
                      params: {
                        id: genre.id,
                        name: encodeURIComponent(genre.name),
                        color: encodeURIComponent(genre.color ?? ""),
                        imageUrl: genre.imageUrl ? encodeURIComponent(genre.imageUrl) : "",
                      },
                    })}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* ── MiniPlayer ── */}
      <MiniPlayer />

      {/* ── BottomNav ── */}
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
