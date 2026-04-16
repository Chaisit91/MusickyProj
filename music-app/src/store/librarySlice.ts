import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { File, Directory, Paths } from "expo-file-system";
const downloadsDir = new Directory(Paths.document, "downloads");
import {
  Song,
  Artist,
  getLikedSongsApi,
  likeSongApi,
  unlikeSongApi,
  getDownloadsApi,
  addDownloadApi,
  removeDownloadApi,
  getFollowedArtistsApi,
  followArtistApi,
  unfollowArtistApi,
} from "../api/homeApi";
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

// ─── Load library (API for liked/downloaded, AsyncStorage for followed) ────────

export const loadLibrary = createAsyncThunk(
  "library/load",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.id ?? null;

    let likedSongs: Song[] = [];
    let downloadedSongs: Song[] = [];
    let followedArtists: Artist[] = [];
    let playlists: Playlist[] = [];

    if (userId) {
      const [likedResult, downloadedResult, playlistsResult, followedResult] = await Promise.allSettled([
        getLikedSongsApi(),
        getDownloadsApi(),
        getPlaylistsApi(),
        getFollowedArtistsApi(),
      ]);

      if (likedResult.status === "fulfilled") likedSongs = likedResult.value;
      if (downloadedResult.status === "fulfilled") downloadedSongs = downloadedResult.value;
      if (playlistsResult.status === "fulfilled") playlists = playlistsResult.value.data.data.map(toPlaylist);
      if (followedResult.status === "fulfilled") followedArtists = followedResult.value;
    }

    return { likedSongs, followedArtists, downloadedSongs, playlists };
  }
);

// ─── Liked Songs thunk (optimistic) ───────────────────────────────────────────

export const toggleLikeSong = createAsyncThunk(
  "library/toggleLikeSong",
  async ({ song, wasLiked }: { song: Song; wasLiked: boolean }) => {
    if (wasLiked) {
      await unlikeSongApi(song.id);
    } else {
      await likeSongApi(song.id);
    }
    return { song, wasLiked };
  }
);

// ─── Downloads thunk (optimistic) ─────────────────────────────────────────────

// Local file helper using expo-file-system v2 API
export const getLocalAudioFile = (songId: string) =>
  new File(downloadsDir, `${songId}.mp3`);

export const toggleDownload = createAsyncThunk(
  "library/toggleDownload",
  async ({ song, wasDownloaded }: { song: Song; wasDownloaded: boolean }) => {
    const localFile = getLocalAudioFile(song.id);

    if (wasDownloaded) {
      await removeDownloadApi(song.id);
      if (localFile.exists) {
        localFile.delete();
      }
    } else {
      // สร้าง folder ถ้ายังไม่มี
      if (!downloadsDir.exists) {
        downloadsDir.create();
      }
      // ดาวน์โหลด MP3 ลงเครื่อง
      await File.downloadFileAsync(song.filePath, localFile, { idempotent: true });
      await addDownloadApi(song.id);
    }
    return { song, wasDownloaded };
  }
);

// ─── Follow Artist thunk (optimistic) ────────────────────────────────────────

export const toggleFollowArtist = createAsyncThunk(
  "library/toggleFollowArtist",
  async ({ artist, wasFollowing }: { artist: Artist; wasFollowing: boolean }) => {
    if (wasFollowing) {
      await unfollowArtistApi(artist.id);
    } else {
      await followArtistApi(artist.id);
    }
    return { artist, wasFollowing };
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
  reducers: {},
  extraReducers: (builder) => {
    // loadLibrary
    builder.addCase(loadLibrary.fulfilled, (state, action) => {
      state.likedSongs = action.payload.likedSongs;
      state.followedArtists = action.payload.followedArtists;
      state.downloadedSongs = action.payload.downloadedSongs;
      state.playlists = action.payload.playlists;
    });

    // toggleLikeSong — optimistic: update on pending, revert on rejected
    builder.addCase(toggleLikeSong.pending, (state, action) => {
      const { song, wasLiked } = action.meta.arg;
      if (wasLiked) {
        state.likedSongs = state.likedSongs.filter((s) => s.id !== song.id);
      } else {
        if (!state.likedSongs.some((s) => s.id === song.id)) {
          state.likedSongs.unshift(song);
        }
      }
    });
    builder.addCase(toggleLikeSong.rejected, (state, action) => {
      const { song, wasLiked } = action.meta.arg;
      if (wasLiked) {
        // Failed to unlike → add back
        if (!state.likedSongs.some((s) => s.id === song.id)) {
          state.likedSongs.unshift(song);
        }
      } else {
        // Failed to like → remove
        state.likedSongs = state.likedSongs.filter((s) => s.id !== song.id);
      }
    });

    // toggleDownload — optimistic: update on pending, revert on rejected
    builder.addCase(toggleDownload.pending, (state, action) => {
      const { song, wasDownloaded } = action.meta.arg;
      if (wasDownloaded) {
        state.downloadedSongs = state.downloadedSongs.filter((s) => s.id !== song.id);
      } else {
        if (!state.downloadedSongs.some((s) => s.id === song.id)) {
          state.downloadedSongs.unshift(song);
        }
      }
    });
    builder.addCase(toggleDownload.rejected, (state, action) => {
      const { song, wasDownloaded } = action.meta.arg;
      if (wasDownloaded) {
        if (!state.downloadedSongs.some((s) => s.id === song.id)) {
          state.downloadedSongs.unshift(song);
        }
      } else {
        state.downloadedSongs = state.downloadedSongs.filter((s) => s.id !== song.id);
      }
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

    // toggleFollowArtist — optimistic
    builder.addCase(toggleFollowArtist.pending, (state, action) => {
      const { artist, wasFollowing } = action.meta.arg;
      if (wasFollowing) {
        state.followedArtists = state.followedArtists.filter((a) => a.id !== artist.id);
      } else {
        if (!state.followedArtists.some((a) => a.id === artist.id)) {
          state.followedArtists.unshift(artist);
        }
      }
    });
    builder.addCase(toggleFollowArtist.rejected, (state, action) => {
      const { artist, wasFollowing } = action.meta.arg;
      if (wasFollowing) {
        if (!state.followedArtists.some((a) => a.id === artist.id)) {
          state.followedArtists.unshift(artist);
        }
      } else {
        state.followedArtists = state.followedArtists.filter((a) => a.id !== artist.id);
      }
    });

    // logout
    builder.addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export default librarySlice.reducer;
