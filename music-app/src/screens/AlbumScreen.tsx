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
import { recordPlay, Song } from "../api/homeApi";
import { getAlbumSongs } from "../api/detailApi";
import { FALLBACK_COLORS, colorFor } from "../constants";
import {
  BackIcon,
  PlayIcon,
  HeartIcon,
  ShareIcon,
  MoreIcon,
  DownloadIcon,
} from "../Components/icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { playSong } from "../store/playerSlice";
import { toggleLikeSong, toggleDownload, loadLibrary } from "../store/librarySlice";
import AddToPlaylistSheet from "../Components/AddToPlaylistSheet";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 300;


// ─── Song Row ─────────────────────────────────────────────────────────────────

const SongRow = ({
  song,
  index,
  showIndex,
  onPress,
  isLiked,
  onLike,
  isDownloaded,
  onDownload,
  onMore,
}: {
  song: Song;
  index: number;
  showIndex: boolean;
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
      {song.coverUrl ? (
        <Image source={{ uri: song.coverUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
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
      <HeartIcon filled={isLiked} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onDownload} activeOpacity={0.7} style={{ padding: 6 }}>
      <DownloadIcon downloaded={isDownloaded} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onMore} activeOpacity={0.7} style={{ padding: 6 }}>
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

  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  useEffect(() => {
    dispatch(loadLibrary());
    getAlbumSongs(albumId)
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [albumId]);

  const isAlbumLiked = songs.length > 0 && likedSongs.some((s) => s.id === songs[0].id);

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
            <TouchableOpacity onPress={() => songs[0] && dispatch(toggleLikeSong(songs[0]))} activeOpacity={0.7} style={{ padding: 4 }}>
              <HeartIcon filled={isAlbumLiked} />
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
              isLiked={likedSongs.some((s) => s.id === song.id)}
              onLike={() => dispatch(toggleLikeSong(song))}
              isDownloaded={downloadedSongs.some((s) => s.id === song.id)}
              onDownload={() => dispatch(toggleDownload(song))}
              onPress={() => handleSongPress(song)}
              onMore={() => setSelectedSong(song)}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddToPlaylistSheet song={selectedSong} onClose={() => setSelectedSong(null)} />
    </View>
  );
}
