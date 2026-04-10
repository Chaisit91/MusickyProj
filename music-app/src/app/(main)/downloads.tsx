import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleDownload, toggleLikeSong, loadLibrary } from "../../store/librarySlice";
import { playSong } from "../../store/playerSlice";
import { recordPlay, Song } from "../../api/homeApi";
import { colorFor } from "../../constants";
import MiniPlayer from "../../Components/player/MiniPlayer";
import AddToPlaylistSheet from "../../Components/ui/AddToPlaylistSheet";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const DownloadedIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#4fc3f7" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill={filled ? "#e84393" : "none"}
      stroke={filled ? "#e84393" : "#666"}
      strokeWidth={2}
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

const PlayIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#000" d="M8 5v14l11-7z" />
  </Svg>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DownloadsScreen() {
  const dispatch = useAppDispatch();
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);
  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  const handlePlay = async (song: Song) => {
    dispatch(playSong({ song, queue: downloadedSongs }));
    try { await recordPlay(song.id); } catch { /* silent */ }
  };

  const handlePlayAll = () => {
    if (downloadedSongs.length > 0) handlePlay(downloadedSongs[0]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero header ── */}
      <View
        style={{
          paddingTop: 56,
          paddingBottom: 24,
          paddingHorizontal: 20,
          backgroundColor: "#0a2a3d",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={{ marginBottom: 20, alignSelf: "flex-start" }}
        >
          <BackIcon />
        </TouchableOpacity>

        {/* Cover */}
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 12,
            backgroundColor: "#4fc3f7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            alignSelf: "center",
          }}
        >
          <Svg width={64} height={64} viewBox="0 0 24 24">
            <Path fill="#fff" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </Svg>
        </View>

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center" }}>
          Downloads
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 13, textAlign: "center", marginTop: 4 }}>
          {downloadedSongs.length} songs · offline
        </Text>

        {/* Play button */}
        {downloadedSongs.length > 0 && (
          <TouchableOpacity
            onPress={handlePlayAll}
            activeOpacity={0.85}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-end",
              marginTop: 16,
            }}
          >
            <PlayIcon />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Song List ── */}
      {downloadedSongs.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#1e1e1e",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg width={36} height={36} viewBox="0 0 24 24">
              <Path fill="#4fc3f7" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </Svg>
          </View>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
            No downloads yet
          </Text>
          <Text style={{ color: "#555", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            Tap the download icon on any song to save it here
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/search")}
            activeOpacity={0.8}
            style={{
              marginTop: 8,
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 24,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ color: "#000", fontSize: 14, fontWeight: "700" }}>Find Songs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={downloadedSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
          renderItem={({ item, index }) => {
            const cover = item.coverUrl;
            const isLiked = likedSongs.some((s) => s.id === item.id);
            return (
              <TouchableOpacity
                onPress={() => handlePlay(item)}
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
                  {cover ? (
                    <Image source={{ uri: cover }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#ffffff60", fontSize: 16 }}>♪</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {item.artist.name} · {item.album.title}
                  </Text>
                </View>

                {/* Like */}
                <TouchableOpacity
                  onPress={() => dispatch(toggleLikeSong({ song: item, wasLiked: isLiked }))}
                  activeOpacity={0.7}
                  style={{ padding: 6 }}
                >
                  <HeartIcon filled={isLiked} />
                </TouchableOpacity>

                {/* Remove download */}
                <TouchableOpacity
                  onPress={() => dispatch(toggleDownload({ song: item, wasDownloaded: true }))}
                  activeOpacity={0.7}
                  style={{ padding: 6 }}
                >
                  <DownloadedIcon />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedSong(item)} activeOpacity={0.7} style={{ padding: 6 }}>
                  <MoreIcon />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <MiniPlayer />
      <AddToPlaylistSheet song={selectedSong} onClose={() => setSelectedSong(null)} />
    </View>
  );
}
