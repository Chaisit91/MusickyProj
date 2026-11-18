import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Ad, fetchAdByType, fetchAnyActiveAd, recordImpressionApi } from "../api/adsApi";
import { loginThunk } from "./authSlice";

interface AdsState {
  currentAd: Ad | null;
  adVisible: boolean;
  adContext: "SPLASH" | "AFTER_SONG" | null;
  pendingNextSong: boolean;
  showingPreHomeAd: boolean; // true = block AuthGuard จาก navigate ไป home ก่อนโฆษณาแสดง
}

const initialState: AdsState = {
  currentAd: null,
  adVisible: false,
  adContext: null,
  pendingNextSong: false,
  showingPreHomeAd: false,
};

// ─── SPLASH ad (ตอน login → home-ads page) ────────────────────────────────────
export const showSplashAd = createAsyncThunk(
  "ads/showSplash",
  async (_, { rejectWithValue }) => {
    try {
      const ad =
        (await fetchAdByType("SPLASH")) ??
        (await fetchAnyActiveAd());
      return ad;
    } catch {
      return rejectWithValue(null);
    }
  }
);

// ─── AFTER_SONG ad (หลังจบเพลง — ระบบสุ่ม 1-3 เพลง) ─────────────────────────
export const showAfterSongAd = createAsyncThunk(
  "ads/showAfterSong",
  async (_, { rejectWithValue }) => {
    try {
      const ad =
        (await fetchAdByType("AFTER_SONG")) ??
        (await fetchAdByType("AFTER_MULTIPLE")) ??
        (await fetchAnyActiveAd());
      return ad;
    } catch {
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
    setShowingPreHomeAd(state, action: PayloadAction<boolean>) {
      state.showingPreHomeAd = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(showSplashAd.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "SPLASH";
        } else {
          state.showingPreHomeAd = false;
        }
      })
      .addCase(showSplashAd.rejected, (state) => {
        state.showingPreHomeAd = false;
      })
      .addCase(showAfterSongAd.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "AFTER_SONG";
        }
      })
      // ตั้ง showingPreHomeAd=true พร้อมกับ isLoggedIn=true เพื่อกัน race condition กับ AuthGuard
      .addCase(loginThunk.fulfilled, (state, action) => {
        const user = (action.payload as any)?.user;
        if (user && !user.isPremium) {
          state.showingPreHomeAd = true;
        }
      });
  },
});

export const { dismissAd, setPendingNextSong, setShowingPreHomeAd } = adsSlice.actions;
export default adsSlice.reducer;
