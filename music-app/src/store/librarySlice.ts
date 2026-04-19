// Redux slice จัดการ library — state: likedSongs, downloadedSongs, followedArtists | actions: toggleLikeSong, toggleDownload, toggleFollowArtist, loadLibrary | รองรับ offline playback ด้วย expo-file-system
//
// หลักการทำงาน:
// 1. loadLibrary: Promise.allSettled fetch liked/downloaded/playlists/followed พร้อมกัน → ใช้เฉพาะที่ fulfilled
// 2. toggleLikeSong (optimistic): pending → เปลี่ยน UI ทันที, rejected → revert กลับ
// 3. toggleDownload: ดาวน์โหลด MP3 ด้วย File.downloadFileAsync (expo-file-system) หรือลบไฟล์ถ้ามีแล้ว + sync backend
// 4. toggleFollowArtist (optimistic): เหมือน toggleLikeSong
// 5. Playlist thunks: CRUD playlist + add/remove song → อัปเดต state ทันทีหลัง API ตอบ
// 6. getLocalAudioFile: คืน File object ชี้ไปที่ /downloads/{songId}.mp3 ใช้โดย AudioController

// นำเข้า createSlice และ createAsyncThunk จาก Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// นำเข้า File, Directory, Paths จาก expo-file-system v2 สำหรับจัดการไฟล์บนอุปกรณ์
import { File, Directory, Paths } from "expo-file-system";
// กำหนด path ของโฟลเดอร์ดาวน์โหลดใน document directory ของแอป
const downloadsDir = new Directory(Paths.document, "downloads");
// นำเข้า API functions และ types สำหรับ liked songs, downloads, followed artists
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
// นำเข้า API functions และ types สำหรับ playlist
import {
  getPlaylistsApi,
  createPlaylistApi,
  deletePlaylistApi,
  addSongToPlaylistApi,
  removeSongFromPlaylistApi,
  ApiPlaylist,
} from "../api/playlistApi";
// นำเข้า logoutThunk เพื่อ reset library เมื่อ logout
import { logoutThunk } from "./authSlice";
// นำเข้า RootState type สำหรับ getState ใน thunk
import type { RootState } from "./store";


// กำหนด interface ของ Playlist ที่ใช้ใน UI (แปลงมาจาก ApiPlaylist)
export interface Playlist {
  id: string;           // รหัสเฉพาะของ playlist
  title: string;        // ชื่อ playlist
  coverUrl: string | null; // URL รูปปก (null ถ้ายังไม่มีเพลงในนั้น)
  createdAt: number;    // timestamp วันที่สร้าง (milliseconds) สำหรับ sort
  songs: Song[];        // รายการเพลงในห้อง playlist นี้
}

// helper function: แปลง ApiPlaylist (รูปแบบ backend) → Playlist (รูปแบบ UI)
const toPlaylist = (p: ApiPlaylist): Playlist => {
  // แยก array ของ Song ออกจาก playlistSongs (ซึ่งเป็น join table)
  const songs = p.playlistSongs.map((ps) => ps.song);
  // ใช้รูปปกของเพลงแรกที่มี coverUrl หรือ album.coverUrl เป็นปก playlist
  const coverUrl = songs.find((s) => s.coverUrl || s.album?.coverUrl)
    ? (songs[0].coverUrl ?? songs[0].album?.coverUrl ?? null)
    : null;
  return {
    id: p.id,
    title: p.name,                               // backend ใช้ "name" แต่ UI ใช้ "title"
    coverUrl,
    createdAt: new Date(p.createdAt).getTime(),  // แปลง ISO string → ms timestamp
    songs,
  };
};

// กำหนด interface ของ LibraryState ที่เก็บข้อมูลห้องสมุดเพลงของผู้ใช้
interface LibraryState {
  likedSongs: Song[];           // เพลงที่ผู้ใช้กด like ไว้
  followedArtists: Artist[];    // ศิลปินที่ผู้ใช้ติดตาม
  downloadedSongs: Song[];      // เพลงที่ดาวน์โหลดลงเครื่องแล้ว
  playlists: Playlist[];        // playlist ทั้งหมดของผู้ใช้
}

// ค่าเริ่มต้น: ทุก list ว่างก่อนที่จะโหลดจาก API
const initialState: LibraryState = {
  likedSongs: [],
  followedArtists: [],
  downloadedSongs: [],
  playlists: [],
};

// ─── Load library (API for liked/downloaded, AsyncStorage for followed) ────────

// โหลดข้อมูล library ทั้งหมดพร้อมกัน — เรียกหลัง login หรือเมื่อแอปเปิด
export const loadLibrary = createAsyncThunk(
  "library/load",
  async (_, { getState }) => {
    // ดึง userId จาก auth state เพื่อตรวจสอบว่ามี user login อยู่ไหม
    const state = getState() as RootState;
    const userId = state.auth.user?.id ?? null;

    // เตรียม default ว่างสำหรับกรณีที่ยังไม่ login หรือ API ล้มเหลว
    let likedSongs: Song[] = [];
    let downloadedSongs: Song[] = [];
    let followedArtists: Artist[] = [];
    let playlists: Playlist[] = [];

    if (userId) {
      // เรียก API ทั้ง 4 พร้อมกันด้วย Promise.allSettled เพื่อไม่ให้ error ตัวใดตัวหนึ่งหยุดทั้งหมด
      const [likedResult, downloadedResult, playlistsResult, followedResult] = await Promise.allSettled([
        getLikedSongsApi(),
        getDownloadsApi(),
        getPlaylistsApi(),
        getFollowedArtistsApi(),
      ]);

      // ใช้ผลลัพธ์เฉพาะที่ fulfilled (สำเร็จ) เท่านั้น
      if (likedResult.status === "fulfilled") likedSongs = likedResult.value;
      if (downloadedResult.status === "fulfilled") downloadedSongs = downloadedResult.value;
      if (playlistsResult.status === "fulfilled") playlists = playlistsResult.value.data.data.map(toPlaylist);
      if (followedResult.status === "fulfilled") followedArtists = followedResult.value;
    }

    return { likedSongs, followedArtists, downloadedSongs, playlists };
  }
);

// ─── Liked Songs thunk (optimistic) ───────────────────────────────────────────

// toggle like/unlike เพลง — ใช้ optimistic update คือ UI เปลี่ยนก่อน API ตอบ
export const toggleLikeSong = createAsyncThunk(
  "library/toggleLikeSong",
  async ({ song, wasLiked }: { song: Song; wasLiked: boolean }) => {
    if (wasLiked) {
      await unlikeSongApi(song.id); // เพลงที่ like อยู่แล้ว → unlike
    } else {
      await likeSongApi(song.id);   // เพลงที่ยังไม่ได้ like → like
    }
    return { song, wasLiked };
  }
);

// ─── Downloads thunk (optimistic) ─────────────────────────────────────────────

// Local file helper using expo-file-system v2 API
// สร้าง File object ที่ชี้ไปที่ไฟล์ MP3 ของเพลงนั้นใน local storage
export const getLocalAudioFile = (songId: string) =>
  new File(downloadsDir, `${songId}.mp3`);

// toggle download/remove download — ดาวน์โหลด MP3 หรือลบออกจากเครื่อง
export const toggleDownload = createAsyncThunk(
  "library/toggleDownload",
  async ({ song, wasDownloaded }: { song: Song; wasDownloaded: boolean }) => {
    const localFile = getLocalAudioFile(song.id); // ชี้ไปที่ไฟล์ MP3 ของเพลงนี้

    if (wasDownloaded) {
      // เพลงนี้ดาวน์โหลดอยู่แล้ว → ลบออกจาก backend และลบไฟล์ local
      await removeDownloadApi(song.id);
      if (localFile.exists) {
        localFile.delete(); // ลบไฟล์ MP3 ออกจากเครื่อง
      }
    } else {
      // สร้าง folder ถ้ายังไม่มี — ป้องกัน error เมื่อพยายามบันทึกไฟล์ในโฟลเดอร์ที่ไม่มีอยู่
      if (!downloadsDir.exists) {
        downloadsDir.create();
      }
      // ดาวน์โหลด MP3 ลงเครื่อง — idempotent=true คือถ้ามีไฟล์อยู่แล้วให้ข้ามไป
      await File.downloadFileAsync(song.filePath, localFile, { idempotent: true });
      await addDownloadApi(song.id); // บันทึก record ลง backend
    }
    return { song, wasDownloaded };
  }
);

// ─── Follow Artist thunk (optimistic) ────────────────────────────────────────

// toggle follow/unfollow ศิลปิน — ใช้ optimistic update เช่นกัน
export const toggleFollowArtist = createAsyncThunk(
  "library/toggleFollowArtist",
  async ({ artist, wasFollowing }: { artist: Artist; wasFollowing: boolean }) => {
    if (wasFollowing) {
      await unfollowArtistApi(artist.id); // กำลัง follow อยู่ → unfollow
    } else {
      await followArtistApi(artist.id);   // ยังไม่ได้ follow → follow
    }
    return { artist, wasFollowing };
  }
);

// ─── Playlist API thunks ───────────────────────────────────────────────────────

// โหลด playlist ทั้งหมดของผู้ใช้จาก API ใหม่
export const fetchPlaylists = createAsyncThunk("library/fetchPlaylists", async () => {
  const res = await getPlaylistsApi();
  return res.data.data.map(toPlaylist); // แปลงเป็น Playlist format ที่ UI ใช้
});

// สร้าง playlist ใหม่ด้วยชื่อที่ระบุ
export const createPlaylistThunk = createAsyncThunk(
  "library/createPlaylist",
  async (title: string) => {
    const res = await createPlaylistApi(title);
    return toPlaylist(res.data.data); // แปลงผลลัพธ์เป็น Playlist format
  }
);

// ลบ playlist ตาม id
export const deletePlaylistThunk = createAsyncThunk(
  "library/deletePlaylist",
  async (playlistId: string) => {
    await deletePlaylistApi(playlistId);
    return playlistId; // คืน id กลับไปให้ reducer ใช้กรอง playlist ออก
  }
);

// เพิ่มเพลงเข้า playlist ที่ระบุ
export const addSongToPlaylistThunk = createAsyncThunk(
  "library/addSongToPlaylist",
  async ({ playlistId, song }: { playlistId: string; song: Song }) => {
    await addSongToPlaylistApi(playlistId, song.id);
    return { playlistId, song }; // คืน playlistId และ song กลับให้ reducer อัปเดต state
  }
);

// ลบเพลงออกจาก playlist ที่ระบุ
export const removeSongFromPlaylistThunk = createAsyncThunk(
  "library/removeSongFromPlaylist",
  async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
    await removeSongFromPlaylistApi(playlistId, songId);
    return { playlistId, songId }; // คืนค่ากลับให้ reducer กรองเพลงออก
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

// สร้าง slice ชื่อ "library" ซึ่งจะกลายเป็น state.library ใน Redux store
const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {}, // ไม่มี synchronous reducer — ทั้งหมดเป็น async thunk
  extraReducers: (builder) => {
    // loadLibrary: บันทึกข้อมูลทั้งหมดลง state เมื่อโหลดสำเร็จ
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
        // ผู้ใช้กด unlike → ลบเพลงออกจาก likedSongs ทันที (ก่อน API ตอบ)
        state.likedSongs = state.likedSongs.filter((s) => s.id !== song.id);
      } else {
        // ผู้ใช้กด like → เพิ่มเพลงเข้าต้น likedSongs ทันที (ถ้ายังไม่มี)
        if (!state.likedSongs.some((s) => s.id === song.id)) {
          state.likedSongs.unshift(song);
        }
      }
    });
    builder.addCase(toggleLikeSong.rejected, (state, action) => {
      const { song, wasLiked } = action.meta.arg;
      if (wasLiked) {
        // Failed to unlike → add back — คืนเพลงกลับเข้า likedSongs เพราะ API ล้มเหลว
        if (!state.likedSongs.some((s) => s.id === song.id)) {
          state.likedSongs.unshift(song);
        }
      } else {
        // Failed to like → remove — ลบเพลงออกเพราะ like ไม่สำเร็จ
        state.likedSongs = state.likedSongs.filter((s) => s.id !== song.id);
      }
    });

    // toggleDownload — optimistic: update on pending, revert on rejected
    builder.addCase(toggleDownload.pending, (state, action) => {
      const { song, wasDownloaded } = action.meta.arg;
      if (wasDownloaded) {
        // ผู้ใช้กดลบ download → ลบออกจาก downloadedSongs ทันที
        state.downloadedSongs = state.downloadedSongs.filter((s) => s.id !== song.id);
      } else {
        // ผู้ใช้กด download → เพิ่มเข้า downloadedSongs ทันที
        if (!state.downloadedSongs.some((s) => s.id === song.id)) {
          state.downloadedSongs.unshift(song);
        }
      }
    });
    builder.addCase(toggleDownload.rejected, (state, action) => {
      const { song, wasDownloaded } = action.meta.arg;
      if (wasDownloaded) {
        // ลบ download ไม่สำเร็จ → คืนเพลงกลับเข้า list
        if (!state.downloadedSongs.some((s) => s.id === song.id)) {
          state.downloadedSongs.unshift(song);
        }
      } else {
        // download ไม่สำเร็จ → ลบออกจาก list (เพราะ optimistic เพิ่มไปแล้ว)
        state.downloadedSongs = state.downloadedSongs.filter((s) => s.id !== song.id);
      }
    });

    // fetchPlaylists: แทนที่ playlist ทั้งหมดด้วยข้อมูลใหม่จาก API
    builder.addCase(fetchPlaylists.fulfilled, (state, action) => {
      state.playlists = action.payload;
    });

    // createPlaylist: เพิ่ม playlist ใหม่เข้าต้น list (ให้แสดงก่อนเสมอ)
    builder.addCase(createPlaylistThunk.fulfilled, (state, action) => {
      state.playlists.unshift(action.payload);
    });

    // deletePlaylist: กรอง playlist ที่ถูกลบออกจาก list
    builder.addCase(deletePlaylistThunk.fulfilled, (state, action) => {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
    });

    // addSongToPlaylist: เพิ่มเพลงเข้า playlist ที่ระบุ และอัปเดต coverUrl ถ้ายังไม่มี
    builder.addCase(addSongToPlaylistThunk.fulfilled, (state, action) => {
      const { playlistId, song } = action.payload;
      const playlist = state.playlists.find((p) => p.id === playlistId);
      if (!playlist) return; // ถ้าหา playlist ไม่เจอให้ข้ามไป
      if (!playlist.songs.some((s) => s.id === song.id)) {
        playlist.songs.push(song); // เพิ่มเพลงเข้า playlist (ถ้ายังไม่มี)
        if (!playlist.coverUrl) {
          // ถ้า playlist ยังไม่มีปก ให้ใช้ปกของเพลงนี้เป็นปก playlist
          playlist.coverUrl = song.coverUrl ?? song.album?.coverUrl ?? null;
        }
      }
    });

    // removeSongFromPlaylist: ลบเพลงออกจาก playlist ที่ระบุ
    builder.addCase(removeSongFromPlaylistThunk.fulfilled, (state, action) => {
      const { playlistId, songId } = action.payload;
      const playlist = state.playlists.find((p) => p.id === playlistId);
      if (playlist) {
        // กรองเพลงที่ต้องการลบออก
        playlist.songs = playlist.songs.filter((s) => s.id !== songId);
      }
    });

    // toggleFollowArtist — optimistic: เปลี่ยน state ทันทีก่อน API ตอบ
    builder.addCase(toggleFollowArtist.pending, (state, action) => {
      const { artist, wasFollowing } = action.meta.arg;
      if (wasFollowing) {
        // กำลัง follow อยู่ → ลบออกทันที
        state.followedArtists = state.followedArtists.filter((a) => a.id !== artist.id);
      } else {
        // ยังไม่ได้ follow → เพิ่มเข้า list ทันที
        if (!state.followedArtists.some((a) => a.id === artist.id)) {
          state.followedArtists.unshift(artist);
        }
      }
    });
    builder.addCase(toggleFollowArtist.rejected, (state, action) => {
      const { artist, wasFollowing } = action.meta.arg;
      if (wasFollowing) {
        // unfollow ล้มเหลว → คืนศิลปินกลับเข้า list
        if (!state.followedArtists.some((a) => a.id === artist.id)) {
          state.followedArtists.unshift(artist);
        }
      } else {
        // follow ล้มเหลว → ลบออกจาก list (เพราะ optimistic เพิ่มไปแล้ว)
        state.followedArtists = state.followedArtists.filter((a) => a.id !== artist.id);
      }
    });

    // logout: reset library ทั้งหมดกลับเป็นค่าว่างเมื่อ logout
    builder.addCase(logoutThunk.fulfilled, () => initialState);
  },
});

// export reducer เพื่อนำไปลงทะเบียนใน store
export default librarySlice.reducer;
