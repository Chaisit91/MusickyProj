import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Song, Artist } from "../api/homeApi";
import {
  getPlaylistsApi,
  createPlaylistApi,
  deletePlaylistApi,
  addSongToPlaylistApi,
  removeSongFromPlaylistApi,
  ApiPlaylist,
} from "../api/playlistApi";
import { logoutThunk } from "./authSlice";
import type { RootState } from "./store";

const userKeys = (userId: string) => ({
  liked: `@library_liked_songs_${userId}`,
  followed: `@library_followed_artists_${userId}`,
  downloaded: `@library_downloaded_songs_${userId}`,
});

export interface Playlist {
  id: string;
  title: string;
  coverUrl: string | null;
  createdAt: number;
  songs: Song[];
}

const toPlaylist = (p: ApiPlaylist): Playlist => {
  const songs = p.playlistSongs.map((ps) => ps.song);
  const coverUrl = songs.find((s) => s.coverUrl || s.album?.coverUrl)
    ? (songs[0].coverUrl ?? songs[0].album?.coverUrl ?? null)
    : null;
  return {
    id: p.id,
    title: p.name,
    coverUrl,
    createdAt: new Date(p.createdAt).getTime(),
    songs,
  };
};

interface LibraryState {
  userId: string | null;
  likedSongs: Song[];
  followedArtists: Artist[];
  downloadedSongs: Song[];
  playlists: Playlist[];
}

const initialState: LibraryState = {
  userId: null,
  likedSongs: [],
  followedArtists: [],
  downloadedSongs: [],
  playlists: [],
};

// ─── Local data thunk (liked / followed / downloaded) ─────────────────────────

export const loadLibrary = createAsyncThunk(
  "library/load",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id ?? null;

    const [likedRaw, followedRaw, downloadedRaw] = userId
      ? await Promise.all([
          AsyncStorage.getItem(userKeys(userId).liked),
          AsyncStorage.getItem(userKeys(userId).followed),
          AsyncStorage.getItem(userKeys(userId).downloaded),
        ])
      : [null, null, null];

    let playlists: Playlist[] = [];
    if (userId) {
      try {
        const res = await getPlaylistsApi();
        playlists = res.data.data.map(toPlaylist);
      } catch {
        // offline — keep empty
      }
    }

    return {
      userId,
      likedSongs: likedRaw ? (JSON.parse(likedRaw) as Song[]) : [],
      followedArtists: followedRaw ? (JSON.parse(followedRaw) as Artist[]) : [],
      downloadedSongs: downloadedRaw ? (JSON.parse(downloadedRaw) as Song[]) : [],
      playlists,
    };
  }
);

// ─── Playlist API thunks ───────────────────────────────────────────────────────

export const fetchPlaylists = createAsyncThunk("library/fetchPlaylists", async () => {
  const res = await getPlaylistsApi();
  return res.data.data.map(toPlaylist);
});

export const createPlaylistThunk = createAsyncThunk(
  "library/createPlaylist",
  async (title: string) => {
    const res = await createPlaylistApi(title);
    return toPlaylist(res.data.data);
  }
);

export const deletePlaylistThunk = createAsyncThunk(
  "library/deletePlaylist",
  async (playlistId: string) => {
    await deletePlaylistApi(playlistId);
    return playlistId;
  }
);

export const addSongToPlaylistThunk = createAsyncThunk(
  "library/addSongToPlaylist",
  async ({ playlistId, song }: { playlistId: string; song: Song }) => {
    await addSongToPlaylistApi(playlistId, song.id);
    return { playlistId, song };
  }
);

export const removeSongFromPlaylistThunk = createAsyncThunk(
  "library/removeSongFromPlaylist",
  async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
    await removeSongFromPlaylistApi(playlistId, songId);
    return { playlistId, songId };
  }
);

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
      if (state.userId) {
        AsyncStorage.setItem(userKeys(state.userId).liked, JSON.stringify(state.likedSongs));
      }
    },
    toggleFollowArtist(state, action: PayloadAction<Artist>) {
      const artist = action.payload;
      const idx = state.followedArtists.findIndex((a) => a.id === artist.id);
      if (idx >= 0) {
        state.followedArtists.splice(idx, 1);
      } else {
        state.followedArtists.unshift(artist);
      }
      if (state.userId) {
        AsyncStorage.setItem(userKeys(state.userId).followed, JSON.stringify(state.followedArtists));
      }
    },
    toggleDownload(state, action: PayloadAction<Song>) {
      const song = action.payload;
      const idx = state.downloadedSongs.findIndex((s) => s.id === song.id);
      if (idx >= 0) {
        state.downloadedSongs.splice(idx, 1);
      } else {
        state.downloadedSongs.unshift(song);
      }
      if (state.userId) {
        AsyncStorage.setItem(userKeys(state.userId).downloaded, JSON.stringify(state.downloadedSongs));
      }
    },
  },
  extraReducers: (builder) => {
    // loadLibrary
    builder.addCase(loadLibrary.fulfilled, (state, action) => {
      state.userId = action.payload.userId;
      state.likedSongs = action.payload.likedSongs;
      state.followedArtists = action.payload.followedArtists;
      state.downloadedSongs = action.payload.downloadedSongs;
      state.playlists = action.payload.playlists;
    });

    // fetchPlaylists
    builder.addCase(fetchPlaylists.fulfilled, (state, action) => {
      state.playlists = action.payload;
    });

    // createPlaylist
    builder.addCase(createPlaylistThunk.fulfilled, (state, action) => {
      state.playlists.unshift(action.payload);
    });

    // deletePlaylist
    builder.addCase(deletePlaylistThunk.fulfilled, (state, action) => {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
    });

    // addSongToPlaylist
    builder.addCase(addSongToPlaylistThunk.fulfilled, (state, action) => {
      const { playlistId, song } = action.payload;
      const playlist = state.playlists.find((p) => p.id === playlistId);
      if (!playlist) return;
      if (!playlist.songs.some((s) => s.id === song.id)) {
        playlist.songs.push(song);
        if (!playlist.coverUrl) {
          playlist.coverUrl = song.coverUrl ?? song.album?.coverUrl ?? null;
        }
      }
    });

    // removeSongFromPlaylist
    builder.addCase(removeSongFromPlaylistThunk.fulfilled, (state, action) => {
      const { playlistId, songId } = action.payload;
      const playlist = state.playlists.find((p) => p.id === playlistId);
      if (playlist) {
        playlist.songs = playlist.songs.filter((s) => s.id !== songId);
      }
    });

    // logout
    builder.addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const {
  toggleLikeSong,
  toggleFollowArtist,
  toggleDownload,
} = librarySlice.actions;
export default librarySlice.reducer;
