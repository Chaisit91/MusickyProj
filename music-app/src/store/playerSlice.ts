import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Song } from "../api/homeApi";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  progressSeconds: number;
  durationSeconds: number;   // duration จริงจาก audio (AudioController อัปเดต)
  seekRequest: number | null; // เมื่อผู้ใช้ seek → AudioController จะ seek แล้ว clear
  isShuffle: boolean;
  repeatMode: "none" | "all" | "one";
  volume: number; // 0.0 – 1.0
}

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  progressSeconds: 0,
  durationSeconds: 0,
  seekRequest: null,
  isShuffle: false,
  repeatMode: "none",
  volume: 1.0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playSong(state, action: PayloadAction<{ song: Song; queue?: Song[]; index?: number }>) {
      const { song, queue, index } = action.payload;
      state.currentSong = song;
      state.queue = queue ?? [song];
      state.currentIndex = index ?? 0;
      state.isPlaying = true;
      state.progressSeconds = 0;
      state.durationSeconds = song.duration ?? 0;
      state.seekRequest = null;
    },

    togglePlay(state) {
      state.isPlaying = !state.isPlaying;
    },

    nextSong(state) {
      if (state.queue.length === 0) return;
      let next: number;
      if (state.isShuffle) {
        next = Math.floor(Math.random() * state.queue.length);
      } else if (state.repeatMode === "one") {
        next = state.currentIndex;
      } else {
        next = state.currentIndex + 1;
        if (next >= state.queue.length) {
          if (state.repeatMode === "all") {
            next = 0;
          } else {
            state.isPlaying = false;
            return;
          }
        }
      }
      state.currentIndex = next;
      state.currentSong = state.queue[next];
      state.progressSeconds = 0;
      state.durationSeconds = state.queue[next].duration ?? 0;
      state.seekRequest = null;
      state.isPlaying = true;
    },

    prevSong(state) {
      if (state.queue.length === 0) return;
      if (state.progressSeconds > 3) {
        state.seekRequest = 0;
        state.progressSeconds = 0;
        return;
      }
      let prev = state.currentIndex - 1;
      if (prev < 0) prev = state.queue.length - 1;
      state.currentIndex = prev;
      state.currentSong = state.queue[prev];
      state.progressSeconds = 0;
      state.durationSeconds = state.queue[prev].duration ?? 0;
      state.seekRequest = null;
      state.isPlaying = true;
    },

    // AudioController เรียกเพื่ออัปเดต progress จาก audio จริง
    setProgress(state, action: PayloadAction<number>) {
      state.progressSeconds = Math.max(0, action.payload);
    },

    // AudioController เรียกเพื่ออัปเดต duration จาก audio จริง
    setDuration(state, action: PayloadAction<number>) {
      state.durationSeconds = action.payload;
    },

    // ผู้ใช้ seek → AudioController จะอ่าน seekRequest แล้ว seek ไฟล์จริง
    seekTo(state, action: PayloadAction<number>) {
      state.seekRequest = action.payload;
      state.progressSeconds = action.payload;
    },

    clearSeekRequest(state) {
      state.seekRequest = null;
    },

    toggleShuffle(state) {
      state.isShuffle = !state.isShuffle;
    },

    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },

    cycleRepeat(state) {
      const modes: Array<"none" | "all" | "one"> = ["none", "all", "one"];
      const idx = modes.indexOf(state.repeatMode);
      state.repeatMode = modes[(idx + 1) % modes.length];
    },

    setRepeatMode(state, action: PayloadAction<"none" | "all" | "one">) {
      state.repeatMode = action.payload;
    },

    addToQueue(state, action: PayloadAction<Song>) {
      state.queue.push(action.payload);
    },

    removeFromQueue(state, action: PayloadAction<number>) {
      const idx = action.payload;
      state.queue.splice(idx, 1);
      if (idx < state.currentIndex) {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      }
    },

    setQueue(state, action: PayloadAction<Song[]>) {
      state.queue = action.payload;
    },
  },
});

export const {
  playSong,
  togglePlay,
  nextSong,
  prevSong,
  setProgress,
  setDuration,
  seekTo,
  clearSeekRequest,
  setVolume,
  toggleShuffle,
  cycleRepeat,
  setRepeatMode,
  addToQueue,
  removeFromQueue,
  setQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
