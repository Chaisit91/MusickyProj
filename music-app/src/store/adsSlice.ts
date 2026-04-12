import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Ad, fetchAdByType, fetchAnyActiveAd, recordImpressionApi } from "../api/adsApi";

const randomThreshold = () => Math.floor(Math.random() * 4) + 2; // 2–5 เพลง

interface AdsState {
  currentAd: Ad | null;
  adVisible: boolean;
  adContext: "SPLASH" | "AFTER_SONG" | "AFTER_MULTIPLE" | null;
  pendingNextSong: boolean;
  songsPlayedCount: number;
  nextAdThreshold: number;
  showingPreHomeAd: boolean; // true = block AuthGuard from navigating to home
}

const initialState: AdsState = {
  currentAd: null,
  adVisible: false,
  adContext: null,
  pendingNextSong: false,
  songsPlayedCount: 0,
  nextAdThreshold: randomThreshold(),
  showingPreHomeAd: false,
};

// ─── SPLASH ad (ตอน login) ─────────────────────────────────────────────────────
// ลอง SPLASH → any active
export const showSplashAd = createAsyncThunk(
  "ads/showSplash",
  async (_, { rejectWithValue }) => {
    try {
      const ad =
        (await fetchAdByType("SPLASH")) ??
        (await fetchAnyActiveAd());
      console.log("[AdsSlice] showSplashAd result:", ad ? `id=${ad.id} type=${ad.adType}` : "null");
      return ad;
    } catch (err) {
      console.warn("[AdsSlice] showSplashAd error:", err);
      return rejectWithValue(null);
    }
  }
);

// ─── AFTER_SONG ad (สำรอง) ────────────────────────────────────────────────────
export const showAfterSongAd = createAsyncThunk(
  "ads/showAfterSong",
  async (_, { rejectWithValue }) => {
    try {
      const ad = await fetchAdByType("AFTER_SONG");
      return ad;
    } catch {
      return rejectWithValue(null);
    }
  }
);

// ─── AFTER_MULTIPLE ad (หลังเล่น N เพลง) ─────────────────────────────────────
// ลอง AFTER_MULTIPLE → AFTER_SONG → any active
export const showAfterMultipleAd = createAsyncThunk(
  "ads/showAfterMultiple",
  async (_, { rejectWithValue }) => {
    try {
      const ad =
        (await fetchAdByType("AFTER_MULTIPLE")) ??
        (await fetchAdByType("AFTER_SONG")) ??
        (await fetchAnyActiveAd());
      console.log("[AdsSlice] showAfterMultipleAd result:", ad ? `id=${ad.id} type=${ad.adType}` : "null");
      return ad;
    } catch (err) {
      console.warn("[AdsSlice] showAfterMultipleAd error:", err);
      return rejectWithValue(null);
    }
  }
);

// ─── Track impression ─────────────────────────────────────────────────────────
export const trackImpression = createAsyncThunk(
  "ads/trackImpression",
  async (id: string) => {
    await recordImpressionApi(id);
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    dismissAd(state) {
      state.adVisible = false;
      state.currentAd = null;
      state.adContext = null;
    },
    setPendingNextSong(state, action: PayloadAction<boolean>) {
      state.pendingNextSong = action.payload;
    },
    songPlayed(state) {
      state.songsPlayedCount += 1;
    },
    resetAdCounter(state) {
      state.songsPlayedCount = 0;
      state.nextAdThreshold = randomThreshold();
    },
    setShowingPreHomeAd(state, action: PayloadAction<boolean>) {
      state.showingPreHomeAd = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(showSplashAd.fulfilled, (state, action) => {
        console.log("[AdsSlice] showSplashAd.fulfilled payload:", action.payload?.id ?? "null");
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "SPLASH";
        } else {
          // No ad found — release the hold so AuthGuard can navigate to home
          state.showingPreHomeAd = false;
        }
      })
      .addCase(showSplashAd.rejected, (state) => {
        // Error fetching ad — release hold so AuthGuard can navigate to home
        state.showingPreHomeAd = false;
      })
      .addCase(showAfterSongAd.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "AFTER_SONG";
          state.pendingNextSong = true;
        }
      })
      .addCase(showAfterMultipleAd.fulfilled, (state, action) => {
        console.log("[AdsSlice] showAfterMultipleAd.fulfilled payload:", action.payload?.id ?? "null");
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "AFTER_MULTIPLE";
          state.pendingNextSong = true;
        }
      });
  },
});

export const { dismissAd, setPendingNextSong, songPlayed, resetAdCounter, setShowingPreHomeAd } = adsSlice.actions;
export default adsSlice.reducer;
