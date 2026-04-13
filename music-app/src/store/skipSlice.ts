import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutThunk } from "./authSlice";

const STORAGE_KEY = "free_skip_data";
const MAX_SKIPS = 5;
const RESET_MS = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

interface SkipState {
  skipsUsed: number;   // จำนวนที่ข้ามไปแล้ววันนี้
  resetAt: number;     // timestamp ที่จะ reset (ms)
}

const initialState: SkipState = {
  skipsUsed: 0,
  resetAt: 0,
};

// ─── โหลดจาก AsyncStorage (เรียกตอน app เปิด) ────────────────────────────────
export const restoreSkips = createAsyncThunk("skip/restore", async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const data: SkipState = JSON.parse(raw);
    // ถ้าหมด 24ชม. แล้ว → reset
    if (Date.now() >= data.resetAt) {
      return { skipsUsed: 0, resetAt: 0 };
    }
    return data;
  } catch {
    return initialState;
  }
});

// ─── บันทึกลง AsyncStorage ───────────────────────────────────────────────────
const persist = (state: SkipState) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
};

const skipSlice = createSlice({
  name: "skip",
  initialState,
  reducers: {
    // เรียกเมื่อผู้ใช้กดข้าม → คืน true ถ้าข้ามได้, false ถ้าหมดแล้ว
    consumeSkip(state) {
      const now = Date.now();
      // ถ้าหมด 24ชม. → reset ก่อน
      if (state.resetAt > 0 && now >= state.resetAt) {
        state.skipsUsed = 0;
        state.resetAt = 0;
      }
      if (state.skipsUsed < MAX_SKIPS) {
        state.skipsUsed += 1;
        // ตั้ง resetAt เฉพาะครั้งแรกของวัน
        if (state.resetAt === 0) {
          state.resetAt = now + RESET_MS;
        }
        persist({ skipsUsed: state.skipsUsed, resetAt: state.resetAt });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSkips.fulfilled, (state, action: PayloadAction<SkipState>) => {
        state.skipsUsed = action.payload.skipsUsed;
        state.resetAt = action.payload.resetAt;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        // ไม่ reset เมื่อ logout เพราะ limit ขึ้นกับอุปกรณ์ ไม่ใช่ account
      });
  },
});

export const { consumeSkip } = skipSlice.actions;
export const FREE_SKIP_LIMIT = MAX_SKIPS;
export default skipSlice.reducer;
