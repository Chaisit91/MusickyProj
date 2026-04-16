import React, { useEffect, useState } from "react";
import {View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
  Dimensions} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playlistSchema } from "../../schema/authSchema";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createPlaylistThunk, deletePlaylistThunk, loadLibrary, Playlist } from "../../store/librarySlice";
import MiniPlayer from "../../Components/player/MiniPlayer";
import BottomNav, { TabName } from "../../Components/layout/Bottomnav";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path fill="#fff" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path fill="#888" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </Svg>
);

const AddIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path fill="#fff" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </Svg>
);

const SortIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#aaa" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
  </Svg>
);

const MusicNoteIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path fill="#ffffff40" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#ff4444" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </Svg>
);

// ─── Fallback colors ──────────────────────────────────────────────────────────

const COVER_COLORS = [
  "#1a1a3e", "#2a0a00", "#001f1a", "#1f1500",
  "#0d1f3c", "#2d0d2d", "#001a00", "#1a0a1a",
];
const colorFor = (i: number) => COVER_COLORS[i % COVER_COLORS.length];

// ─── Playlist Card ────────────────────────────────────────────────────────────

const PlaylistCard = ({
  playlist,
  index,
  onPress,
  onLongPress,
}: {
  playlist: Playlist;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    onLongPress={onLongPress}
    activeOpacity={0.8}
    style={{ width: CARD_W, marginBottom: 16 }}
  >
    <View
      style={{
        width: CARD_W,
        height: CARD_W,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: colorFor(index),
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {playlist.coverUrl ? (
        <Image source={{ uri: playlist.coverUrl }} style={{ width: CARD_W, height: CARD_W }} contentFit="cover" />
      ) : (
        <MusicNoteIcon />
      )}
    </View>
    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
      {playlist.title}
    </Text>
    <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }} numberOfLines={1}>
      Playlist • Myself
    </Text>
  </TouchableOpacity>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PlaylistsScreen() {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((s) => s.library.playlists);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>("Your Library");

  const { control, handleSubmit, reset, formState: { errors } } = useForm<{ title: string }>({
    resolver: zodResolver(playlistSchema),
    defaultValues: { title: "" },
  });

  const titleValue = useWatch({ control, name: "title" });

  useEffect(() => {
    dispatch(loadLibrary());
  }, []);

  const filtered = query.trim()
    ? playlists.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : playlists;

  const handleCreate = handleSubmit((data) => {
    dispatch(createPlaylistThunk(data.title.trim()));
    reset();
    setShowCreate(false);
  });

  const handleDelete = (id: string) => {
    dispatch(deletePlaylistThunk(id));
    setSelectedId(null);
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "Home") router.replace("/home");
    if (tab === "Search") router.replace("/search");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>Playlists</Text>
        </View>
        <Text style={{ color: "#888", fontSize: 13, marginLeft: 38 }}>
          {playlists.length} playlists
        </Text>
      </View>

      {/* ── Search + Add ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2a2a2a",
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 40,
            gap: 8,
          }}
        >
          <SearchIcon />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#555"
            style={{ flex: 1, color: "#fff", fontSize: 14, padding: 0 }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "#2a2a2a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AddIcon />
        </TouchableOpacity>
      </View>

      {/* ── Sort row ── */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 16 }}>
        <SortIcon />
        <Text style={{ color: "#aaa", fontSize: 13, fontWeight: "600" }}>Recents</Text>
      </View>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 }}>
          <Svg width={48} height={48} viewBox="0 0 24 24">
            <Path fill="#333" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </Svg>
          <Text style={{ color: "#555", fontSize: 14 }}>
            {query ? `No results for "${query}"` : "No playlists yet"}
          </Text>
          {!query && (
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              activeOpacity={0.8}
              style={{
                marginTop: 4,
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: "#2a2a2a",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Create playlist</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 160 }}
          renderItem={({ item, index }) => (
            <PlaylistCard
              playlist={item}
              index={index}
              onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: item.id } })}
              onLongPress={() => setSelectedId(item.id)}
            />
          )}
        />
      )}

      {/* ── Create Modal ── */}
      <Modal
        transparent
        visible={showCreate}
        animationType="fade"
        onRequestClose={() => { setShowCreate(false); reset(); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", paddingHorizontal: 32 }}
          onPress={() => { setShowCreate(false); reset(); }}
        >
          <Pressable onPress={() => {}} style={{ backgroundColor: "#1e1e1e", borderRadius: 16, padding: 24 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 16 }}>
              New Playlist
            </Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Playlist name"
                  placeholderTextColor="#555"
                  autoFocus
                  style={{
                    backgroundColor: "#2a2a2a",
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: "#fff",
                    fontSize: 15,
                    marginBottom: errors.title ? 4 : 20,
                    borderWidth: 1,
                    borderColor: errors.title ? "#ff4444" : "transparent",
                  }}
                />
              )}
            />
            {errors.title && (
              <Text style={{ color: "#ff4444", fontSize: 12, marginBottom: 16 }}>{errors.title.message}</Text>
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setShowCreate(false); reset(); }}
                activeOpacity={0.8}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#2a2a2a", alignItems: "center" }}
              >
                <Text style={{ color: "#aaa", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                activeOpacity={0.8}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 8,
                  backgroundColor: titleValue?.trim() ? "#fff" : "#333",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: titleValue?.trim() ? "#000" : "#666", fontWeight: "700" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal transparent visible={!!selectedId} animationType="fade" onRequestClose={() => setSelectedId(null)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}
          onPress={() => setSelectedId(null)}
        >
          <Pressable onPress={() => {}} style={{ backgroundColor: "#1e1e1e", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 }}>
            <View style={{ width: 40, height: 4, backgroundColor: "#333", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 20 }}>
              {playlists.find((p) => p.id === selectedId)?.title}
            </Text>
            <TouchableOpacity
              onPress={() => selectedId && handleDelete(selectedId)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#2a2a2a",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <TrashIcon />
              <Text style={{ color: "#ff4444", fontSize: 15, fontWeight: "600" }}>Delete Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedId(null)}
              activeOpacity={0.7}
              style={{ alignItems: "center", paddingVertical: 14, marginTop: 4 }}
            >
              <Text style={{ color: "#666", fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}
