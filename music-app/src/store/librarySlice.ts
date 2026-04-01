import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Song, Artist } from "../api/homeApi";

const LIKED_KEY = "@library_liked_songs";
const FOLLOWED_KEY = "@library_followed_artists";
const DOWNLOADED_KEY = "@library_downloaded_songs";
const PLAYLISTS_KEY = "@library_playlists";

export interface Playlist {
  id: string;
  title: string;
  coverUrl: string | null;
  createdAt: number;
  songs: Song[];
}

interface LibraryState {
  likedSongs: Song[];
  followedArtists: Artist[];
  downloadedSongs: Song[];
  playlists: Playlist[];
}

const initialState: LibraryState = {
  likedSongs: [],
  followedArtists: [],
  downloadedSongs: [],
  playlists: [],
};

// ─── Async thunks for persistence ─────────────────────────────────────────────

export const loadLibrary = createAsyncThunk("library/load", async () => {
  const [likedRaw, followedRaw, downloadedRaw, playlistsRaw] = await Promise.all([
    AsyncStorage.getItem(LIKED_KEY),
    AsyncStorage.getItem(FOLLOWED_KEY),
    AsyncStorage.getItem(DOWNLOADED_KEY),
    AsyncStorage.getItem(PLAYLISTS_KEY),
  ]);
  return {
    likedSongs: likedRaw ? (JSON.parse(likedRaw) as Song[]) : [],
    followedArtists: followedRaw ? (JSON.parse(followedRaw) as Artist[]) : [],
    downloadedSongs: downloadedRaw ? (JSON.parse(downloadedRaw) as Song[]) : [],
    playlists: playlistsRaw ? (JSON.parse(playlistsRaw) as Playlist[]) : [],
  };
});

// ─── Slice ─────────────────────────────────────────────────────────────────────

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    toggleLikeSong(state, action: PayloadAction<Song>) {
      const song = action.payload;
      const idx = state.likedSongs.findIndex((s) => s.id === song.id);
      if (idx >= 0) {
        state.likedSongs.splice(idx, 1);
      } else {
        state.likedSongs.unshift(song);
      }
      AsyncStorage.setItem(LIKED_KEY, JSON.stringify(state.likedSongs));
    },
    toggleFollowArtist(state, action: PayloadAction<Artist>) {
      const artist = action.payload;
      const idx = state.followedArtists.findIndex((a) => a.id === artist.id);
      if (idx >= 0) {
        state.followedArtists.splice(idx, 1);
      } else {
        state.followedArtists.unshift(artist);
      }
      AsyncStorage.setItem(FOLLOWED_KEY, JSON.stringify(state.followedArtists));
    },
    toggleDownload(state, action: PayloadAction<Song>) {
      const song = action.payload;
      const idx = state.downloadedSongs.findIndex((s) => s.id === song.id);
      if (idx >= 0) {
        state.downloadedSongs.splice(idx, 1);
      } else {
        state.downloadedSongs.unshift(song);
      }
      AsyncStorage.setItem(DOWNLOADED_KEY, JSON.stringify(state.downloadedSongs));
    },
    createPlaylist(state, action: PayloadAction<{ id: string; title: string; coverUrl?: string | null }>) {
      const playlist: Playlist = {
        id: action.payload.id,
        title: action.payload.title,
        coverUrl: action.payload.coverUrl ?? null,
        createdAt: Date.now(),
        songs: [],
      };
      state.playlists.unshift(playlist);
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(state.playlists));
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(state.playlists));
    },
    addSongToPlaylist(state, action: PayloadAction<{ playlistId: string; song: Song }>) {
      const playlist = state.playlists.find((p) => p.id === action.payload.playlistId);
      if (!playlist) return;
      const alreadyIn = playlist.songs.some((s) => s.id === action.payload.song.id);
      if (!alreadyIn) {
        playlist.songs.push(action.payload.song);
        // Auto-set cover from first song added
        if (!playlist.coverUrl) {
          playlist.coverUrl =
            action.payload.song.coverUrl ?? action.payload.song.album.coverUrl ?? null;
        }
      }
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(state.playlists));
    },
    removeSongFromPlaylist(state, action: PayloadAction<{ playlistId: string; songId: string }>) {
      const playlist = state.playlists.find((p) => p.id === action.payload.playlistId);
      if (!playlist) return;
      playlist.songs = playlist.songs.filter((s) => s.id !== action.payload.songId);
      AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(state.playlists));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadLibrary.fulfilled, (state, action) => {
      state.likedSongs = action.payload.likedSongs;
      state.followedArtists = action.payload.followedArtists;
      state.downloadedSongs = action.payload.downloadedSongs;
      state.playlists = action.payload.playlists;
    });
  },
});

export const {
  toggleLikeSong,
  toggleFollowArtist,
  toggleDownload,
  createPlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} = librarySlice.actions;
export default librarySlice.reducer;
