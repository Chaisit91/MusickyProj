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
import Svg, { Path } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { playSong } from "../../store/playerSlice";
import {
  toggleLikeSong,
  toggleDownload,
  removeSongFromPlaylistThunk,
} from "../../store/librarySlice";
import { recordPlay, Song } from "../api/homeApi";
import { FALLBACK_COLORS, colorFor } from "../../constants";
import {
  BackIcon,
  PlayIcon,
  HeartIcon,
  DownloadIcon,
  MoreIcon,
  MusicNoteIcon,
} from "../../Components/ui/icons";
import MiniPlayer from "../../Components/player/MiniPlayer";
import AddToPlaylistSheet from "../../Components/ui/AddToPlaylistSheet";


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
