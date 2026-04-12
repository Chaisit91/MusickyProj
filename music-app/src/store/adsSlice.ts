import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Ad, fetchAdByType, recordImpressionApi } from "../api/adsApi";

interface AdsState {
  currentAd: Ad | null;
  adVisible: boolean;
  adContext: "SPLASH" | "AFTER_SONG" | null;
  // เก็บ callback ว่าหลัง ad จบให้ทำอะไร
  pendingNextSong: boolean;
}

const initialState: AdsState = {
  currentAd: null,
  adVisible: false,
  adContext: null,
  pendingNextSong: false,
};

// โหลดและแสดง SPLASH ad (ตอน login)
export const showSplashAd = createAsyncThunk(
  "ads/showSplash",
  async (_, { rejectWithValue }) => {
    try {
      const ad = await fetchAdByType("SPLASH");
      return ad;
    } catch {
      return rejectWithValue(null);
    }
  }
);

// โหลดและแสดง AFTER_SONG ad (ระหว่างเพลง)
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

// บันทึก impression
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(showSplashAd.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "SPLASH";
        }
      })
      .addCase(showAfterSongAd.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "AFTER_SONG";
          state.pendingNextSong = true;
        }
        // ถ้าไม่มี ad → pendingNextSong ให้ caller จัดการ nextSong เอง
      });
  },
});

export const { dismissAd, setPendingNextSong } = adsSlice.actions;
export default adsSlice.reducer;
