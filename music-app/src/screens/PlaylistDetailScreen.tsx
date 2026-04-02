import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { playSong } from "../store/playerSlice";
import {
  toggleLikeSong,
  toggleDownload,
  removeSongFromPlaylistThunk,
} from "../store/librarySlice";
import { recordPlay, Song } from "../api/homeApi";
import MiniPlayer from "../Components/MiniPlayer";
import AddToPlaylistSheet from "../Components/AddToPlaylistSheet";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#000" d="M8 5v14l11-7z" />
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

const DownloadIcon = ({ downloaded }: { downloaded: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      fill={downloaded ? "#4fc3f7" : "#555"}
      d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
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

const MusicNoteIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path fill="#ffffff40" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </Svg>
);

// ─── Fallback colors ──────────────────────────────────────────────────────────

const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];
const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const playlist = useAppSelector((s) =>
    s.library.playlists.find((p) => p.id === id)
  );
  const likedSongs = useAppSelector((s) => s.library.likedSongs);
  const downloadedSongs = useAppSelector((s) => s.library.downloadedSongs);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  if (!playlist) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#555" }}>Playlist not found</Text>
      </View>
    );
  }

  const songs = playlist.songs;

  const handlePlay = async (song: Song, queue: Song[]) => {
    dispatch(playSong({ song, queue }));
    try { await recordPlay(song.id); } catch { /* silent */ }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) handlePlay(songs[0], songs);
  };

  const handleRemoveFromPlaylist = (songId: string) => {
    dispatch(removeSongFromPlaylistThunk({ playlistId: playlist.id, songId }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero header ── */}
      <View style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, backgroundColor: "#1a1a3e" }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ marginBottom: 20, alignSelf: "flex-start" }}>
          <BackIcon />
        </TouchableOpacity>

        {/* Cover */}
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#2a2a4a",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            alignSelf: "center",
          }}
        >
          {playlist.coverUrl ? (
            <Image source={{ uri: playlist.coverUrl }} style={{ width: 140, height: 140 }} resizeMode="cover" />
          ) : (
            <MusicNoteIcon />
          )}
        </View>

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center" }}>
          {playlist.title}
        </Text>
        <Text style={{ color: "#ffffff80", fontSize: 13, textAlign: "center", marginTop: 4 }}>
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </Text>

        {songs.length > 0 && (
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

      {/* ── Song list ── */}
      {songs.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Svg width={48} height={48} viewBox="0 0 24 24">
            <Path fill="none" stroke="#333" strokeWidth={1.5} d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </Svg>
          <Text style={{ color: "#555", fontSize: 14 }}>No songs yet</Text>
          <Text style={{ color: "#444", fontSize: 12 }}>Tap ••• on any song to add it here</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          renderItem={({ item, index }) => {
            const cover = item.coverUrl;
            const isLiked = likedSongs.some((s) => s.id === item.id);
            const isDownloaded = downloadedSongs.some((s) => s.id === item.id);
            return (
              <TouchableOpacity
                onPress={() => handlePlay(item, songs)}
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
                <View style={{ width: 48, height: 48, borderRadius: 6, overflow: "hidden", backgroundColor: colorFor(index) }}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#ffffff60", fontSize: 16 }}>♪</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {item.artist?.name} · {item.album?.title}
                  </Text>
                </View>

                {/* Like */}
                <TouchableOpacity onPress={() => dispatch(toggleLikeSong(item))} activeOpacity={0.7} style={{ padding: 6 }}>
                  <HeartIcon filled={isLiked} />
                </TouchableOpacity>

                {/* Download */}
                <TouchableOpacity onPress={() => dispatch(toggleDownload(item))} activeOpacity={0.7} style={{ padding: 6 }}>
                  <DownloadIcon downloaded={isDownloaded} />
                </TouchableOpacity>

                {/* More */}
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
