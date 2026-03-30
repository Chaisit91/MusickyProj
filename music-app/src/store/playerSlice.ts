import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Song } from "../api/homeApi";

// ─── State ────────────────────────────────────────────────────────────────────

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  progressSeconds: number;
  isShuffle: boolean;
  repeatMode: "none" | "all" | "one";
}

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  progressSeconds: 0,
  isShuffle: false,
  repeatMode: "none",
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playSong(
      state,
      action: PayloadAction<{ song: Song; queue?: Song[]; index?: number }>
    ) {
      const { song, queue, index } = action.payload;
      state.currentSong = song;
      state.queue = queue ?? [song];
      state.currentIndex = index ?? 0;
      state.isPlaying = true;
      state.progressSeconds = 0;
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
          next = state.repeatMode === "all" ? 0 : state.currentIndex;
          if (state.repeatMode === "none") {
            state.isPlaying = false;
            return;
          }
        }
      }
      state.currentIndex = next;
      state.currentSong = state.queue[next];
      state.progressSeconds = 0;
      state.isPlaying = true;
    },

    prevSong(state) {
      if (state.queue.length === 0) return;
      // If >3 seconds in, restart current song
      if (state.progressSeconds > 3) {
        state.progressSeconds = 0;
        return;
      }
      let prev = state.currentIndex - 1;
      if (prev < 0) prev = state.queue.length - 1;
      state.currentIndex = prev;
      state.currentSong = state.queue[prev];
      state.progressSeconds = 0;
      state.isPlaying = true;
    },

    setProgress(state, action: PayloadAction<number>) {
      state.progressSeconds = Math.max(0, action.payload);
    },

    toggleShuffle(state) {
      state.isShuffle = !state.isShuffle;
    },

    cycleRepeat(state) {
      const modes: Array<"none" | "all" | "one"> = ["none", "all", "one"];
      const idx = modes.indexOf(state.repeatMode);
      state.repeatMode = modes[(idx + 1) % modes.length];
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
  toggleShuffle,
  cycleRepeat,
  addToQueue,
  removeFromQueue,
  setQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
