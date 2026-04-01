import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../store/librarySlice";
import { Song } from "../api/homeApi";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#1db954" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </Svg>
);

const AddIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </Svg>
);

const MusicIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path fill="#ffffff30" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </Svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  song: Song | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddToPlaylistSheet({ song, onClose }: Props) {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((s) => s.library.playlists);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  if (!song) return null;

  const handleToggle = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const isIn = playlist.songs.some((s) => s.id === song.id);
    if (isIn) {
      dispatch(removeSongFromPlaylist({ playlistId, songId: song.id }));
    } else {
      dispatch(addSongToPlaylist({ playlistId, song }));
    }
  };

  const handleCreateAndAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    const newId = Date.now().toString();
    dispatch(createPlaylist({ id: newId, title }));
    dispatch(addSongToPlaylist({ playlistId: newId, song }));
    setNewTitle("");
    setShowCreate(false);
  };

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: "#1a1a1a",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 36,
            maxHeight: "75%",
          }}
        >
          {/* Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16 }} />

          {/* Song info */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 16, gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: "#2a2a2a" }}>
              {(song.coverUrl || song.album.coverUrl) ? (
                <Image
                  source={{ uri: (song.coverUrl || song.album.coverUrl)! }}
                  style={{ width: 44, height: 44 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <MusicIcon />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }} numberOfLines={1}>
                {song.title}
              </Text>
              <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                {song.artist.name}
              </Text>
            </View>
          </View>

          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", paddingHorizontal: 20, marginBottom: 12 }}>
            Add to playlist
          </Text>

          <View style={{ height: 1, backgroundColor: "#ffffff10", marginHorizontal: 20, marginBottom: 8 }} />

          {/* New Playlist button */}
          {showCreate ? (
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Playlist name"
                placeholderTextColor="#555"
                autoFocus
                style={{
                  backgroundColor: "#2a2a2a",
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: "#fff",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => { setShowCreate(false); setNewTitle(""); }}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: "#2a2a2a", alignItems: "center" }}
                >
                  <Text style={{ color: "#aaa", fontWeight: "600", fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateAndAdd}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 8,
                    backgroundColor: newTitle.trim() ? "#1db954" : "#333",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: newTitle.trim() ? "#fff" : "#666", fontWeight: "700", fontSize: 13 }}>
                    Create & Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 12,
                gap: 14,
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 6,
                backgroundColor: "#2a2a2a",
                alignItems: "center", justifyContent: "center",
              }}>
                <AddIcon />
              </View>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>New playlist</Text>
            </TouchableOpacity>
          )}

          {/* Existing playlists */}
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item }) => {
              const isIn = item.songs.some((s) => s.id === song.id);
              const cover = item.coverUrl;
              return (
                <TouchableOpacity
                  onPress={() => handleToggle(item.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    gap: 14,
                  }}
                >
                  {/* Cover */}
                  <View style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", backgroundColor: "#2a2a2a" }}>
                    {cover ? (
                      <Image source={{ uri: cover }} style={{ width: 44, height: 44 }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <MusicIcon />
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                      {item.songs.length} songs
                    </Text>
                  </View>

                  {/* Check */}
                  {isIn && <CheckIcon />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={{ color: "#555", fontSize: 13, paddingHorizontal: 20, paddingVertical: 8 }}>
                No playlists yet — create one above
              </Text>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
