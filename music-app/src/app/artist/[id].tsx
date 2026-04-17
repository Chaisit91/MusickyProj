import React, { useEffect, useState } from "react";
import {View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Song } from "../../api/homeApi";
import { getArtistSongs } from "../../api/detailApi";
import { FALLBACK_COLORS, colorFor } from "../../constants";
import {
  BackIcon,
  PlayIcon,
  ShareIcon,
  MoreIcon,
  HeartIcon as HeartSmallIcon,
  DownloadIcon as DownloadSmallIcon,
} from "../../Components/ui/icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { playSong } from "../../store/playerSlice";
import { toggleFollowArtist, toggleLikeSong, toggleDownload, loadLibrary } from "../../store/librarySlice";
import MiniPlayer from "../../Components/player/MiniPlayer";
import AddToPlaylistSheet from "../../Components/ui/AddToPlaylistSheet";
import BottomNav, { TabName } from "../../Components/layout/Bottomnav";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 280;

// ─── Song Row ─────────────────────────────────────────────────────────────────

const SongRow = ({
  song,
  index,
  onPress,
  isLiked,
  onLike,
  isDownloaded,
  onDownload,
  onMore,
}: {
  song: Song;
  index: number;
  onPress: () => void;
  isLiked: boolean;
  onLike: () => void;
  isDownloaded: boolean;
  onDownload: () => void;
  onMore: () => void;
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
      {song.coverUrl ? (
        <Image source={{ uri: song.coverUrl }} style={{ width: 48, height: 48 }} contentFit="cover" />
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

    <TouchableOpacity onPress={onLike} activeOpacity={0.7} style={{ padding: 6 }}>
      <HeartSmallIcon filled={isLiked} />
    </TouchableOpacity>

    <TouchableOpacity onPress={onDownload} activeOpacity={0.7} style={{ padding: 6 }}>
      <DownloadSmallIcon downloaded={isDownloaded} />
    </TouchableOpacity>

    <TouchableOpacity onPress={onMore} activeOpacity={0.7} style={{ padding: 6 }}>
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
  const paramName = params.name ? decodeURIComponent(params.name) : "";
  const paramImageUrl = params.imageUrl ? decodeURIComponent(params.imageUrl) : "";

  const dispatch = useAppDispatch();
  const followedArtists = useAppSelector((s) => s.library.followedArtists);
  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);
  const followed = followedArtists.some((a) => a.id === artistId);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>("Search");

  // Derive artist info from loaded songs as source of truth; fall back to params
  const artistFromSongs = songs[0]?.artist;
  const artistName = artistFromSongs?.name || paramName;
  const artistImageUrl = artistFromSongs?.imageUrl || paramImageUrl || null;

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Search") router.replace("/search");
    if (tab === "Your Library") router.replace("/your-library");
  };

  useEffect(() => {
    dispatch(loadLibrary());
    getArtistSongs(artistId)
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [artistId]);

  const handleSongPress = (song: Song) => {
    dispatch(playSong({ song, queue: songs.length > 0 ? songs : [song] }));
    router.push("/player");
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
              contentFit="cover"
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
              onPress={() => dispatch(toggleFollowArtist({ artist: { id: artistId, name: artistName, imageUrl: artistImageUrl }, wasFollowing: followed }))}

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
                  backgroundColor: "#2e2e3e",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#ffffff22",
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
              isLiked={likedSongs.some((s) => s.id === song.id)}
              onLike={() => dispatch(toggleLikeSong({ song, wasLiked: likedSongs.some((s) => s.id === song.id) }))}
              isDownloaded={downloadedSongs.some((s) => s.id === song.id)}
              onDownload={() => dispatch(toggleDownload({ song, wasDownloaded: downloadedSongs.some((s) => s.id === song.id) }))}
              onMore={() => setSelectedSong(song)}
            />
          ))
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      <AddToPlaylistSheet song={selectedSong} onClose={() => setSelectedSong(null)} />
    </View>
  );
}
