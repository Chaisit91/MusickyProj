// Redux slice ระบบโฆษณา — state: currentAd, adVisible, adContext (SPLASH/AFTER_SONG), pendingNextSong, showingPreHomeAd | thunks: showSplashAd, showAfterSongAd, trackImpression | ตั้ง showingPreHomeAd=true หลัง login สำหรับ free user
//
// หลักการทำงาน:
// 1. loginThunk.fulfilled: ถ้า user ไม่ใช่ premium → ตั้ง showingPreHomeAd=true (บล็อก AuthGuard ก่อน navigate)
// 2. showSplashAd thunk: fetch SPLASH ad → ถ้ามี ตั้ง currentAd + adVisible + adContext="SPLASH"
// 3. showAfterSongAd thunk: fetch AFTER_SONG/AFTER_MULTIPLE ad → ถ้ามี ตั้ง state เพื่อแสดง BetweenSongAd
// 4. dismissAd: ล้าง adVisible + currentAd + adContext
// 5. showingPreHomeAd: flag ป้องกัน AuthGuard redirect ก่อนโฆษณา SPLASH แสดงเสร็จ

// นำเข้า createSlice, createAsyncThunk และ PayloadAction จาก Redux Toolkit
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// นำเข้า type Ad และ API functions สำหรับดึงโฆษณาและบันทึก impression
import { Ad, fetchAdByType, fetchAnyActiveAd, recordImpressionApi } from "../api/adsApi";
// นำเข้า loginThunk เพื่อดักจับ event หลัง login สำเร็จแล้วตั้ง flag โฆษณา
import { loginThunk } from "./authSlice";

// กำหนด interface ของ state สำหรับระบบโฆษณา
interface AdsState {
  currentAd: Ad | null;                         // ข้อมูลโฆษณาที่กำลังแสดงอยู่ (null = ไม่มีโฆษณา)
  adVisible: boolean;                            // true = กำลังแสดงโฆษณาอยู่
  adContext: "SPLASH" | "AFTER_SONG" | null;    // บริบทที่โฆษณาถูกเรียก เพื่อตัดสินใจ navigate หลังปิด
  pendingNextSong: boolean;                      // true = มีเพลงรอเล่นหลังโฆษณาจบ
  showingPreHomeAd: boolean;                     // true = block AuthGuard จาก navigate ไป home ก่อนโฆษณาแสดง
}

// ค่าเริ่มต้น: ยังไม่มีโฆษณา ทุก flag เป็น false/null
const initialState: AdsState = {
  currentAd: null,
  adVisible: false,
  adContext: null,
  pendingNextSong: false,
  showingPreHomeAd: false,
};

// ─── SPLASH ad (ตอน login → home-ads page) ────────────────────────────────────
// โหลดโฆษณาประเภท SPLASH (แสดงหลัง login ก่อนเข้าหน้าหลัก)
export const showSplashAd = createAsyncThunk(
  "ads/showSplash",
  async (_, { rejectWithValue }) => {
    try {
      // ลอง fetch SPLASH ad ก่อน ถ้าไม่มีให้ใช้โฆษณาใดก็ได้ที่ active อยู่
      const ad =
        (await fetchAdByType("SPLASH")) ??
        (await fetchAnyActiveAd());
      return ad; // คืน ad object หรือ null ถ้าไม่มีโฆษณาเลย
    } catch {
      return rejectWithValue(null); // โหลดล้มเหลว → ไม่แสดงโฆษณา
    }
  }
);

// ─── AFTER_SONG ad (หลังจบเพลง — ระบบสุ่ม 1-3 เพลง) ─────────────────────────
// โหลดโฆษณาประเภท AFTER_SONG หรือ AFTER_MULTIPLE (แสดงระหว่างเพลง)
export const showAfterSongAd = createAsyncThunk(
  "ads/showAfterSong",
  async (_, { rejectWithValue }) => {
    try {
      // ลำดับความสำคัญ: AFTER_SONG → AFTER_MULTIPLE → โฆษณาใดก็ได้ที่ active
      const ad =
        (await fetchAdByType("AFTER_SONG")) ??
        (await fetchAdByType("AFTER_MULTIPLE")) ??
        (await fetchAnyActiveAd());
      return ad; // คืน ad object หรือ null ถ้าไม่มีโฆษณา
    } catch {
      return rejectWithValue(null); // โหลดล้มเหลว → ข้ามโฆษณา
    }
  }
);

// ─── Track impression ─────────────────────────────────────────────────────────
// บันทึก impression (ว่าโฆษณาถูกดูแล้ว) ไปยัง backend เพื่อ analytics
export const trackImpression = createAsyncThunk(
  "ads/trackImpression",
  async (id: string) => {
    await recordImpressionApi(id); // ส่ง ad id ไปบันทึกใน backend
  }
);

// สร้าง slice ชื่อ "ads" ซึ่งจะกลายเป็น state.ads ใน Redux store
const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    // action: ปิดโฆษณาที่แสดงอยู่ — ล้าง currentAd, adContext และตั้ง adVisible=false
    dismissAd(state) {
      state.adVisible = false;    // ซ่อน overlay โฆษณา
      state.currentAd = null;     // ล้างข้อมูลโฆษณา
      state.adContext = null;     // ล้างบริบท เพื่อให้ navigation logic รู้ว่าโฆษณาจบแล้ว
    },
    // action: ตั้งค่าว่ามีเพลงรอเล่นหลังโฆษณาจบหรือไม่
    setPendingNextSong(state, action: PayloadAction<boolean>) {
      state.pendingNextSong = action.payload;
    },
    // action: ตั้งค่า flag ว่ากำลังอยู่ระหว่างแสดงโฆษณาก่อนเข้าหน้าหลัก
    setShowingPreHomeAd(state, action: PayloadAction<boolean>) {
      state.showingPreHomeAd = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(showSplashAd.fulfilled, (state, action) => {
        if (action.payload) {
          // มีโฆษณา SPLASH → ตั้งค่าเพื่อแสดง
          state.currentAd = action.payload;  // เก็บข้อมูลโฆษณา
          state.adVisible = true;            // เปิด overlay แสดงโฆษณา
          state.adContext = "SPLASH";        // บอก navigation ว่าเป็น splash context
        } else {
          // ไม่มีโฆษณา → ปิด flag ที่บล็อก navigation เพื่อให้ไปหน้า home ได้เลย
          state.showingPreHomeAd = false;
        }
      })
      .addCase(showSplashAd.rejected, (state) => {
        // โหลดโฆษณาล้มเหลว → ปิด flag เพื่อไม่บล็อก navigation ค้างอยู่
        state.showingPreHomeAd = false;
      })
      .addCase(showAfterSongAd.fulfilled, (state, action) => {
        if (action.payload) {
          // มีโฆษณา AFTER_SONG → แสดงระหว่างเพลง
          state.currentAd = action.payload;
          state.adVisible = true;
          state.adContext = "AFTER_SONG";
        }
        // ถ้าไม่มีโฆษณา → ไม่เปลี่ยน state ให้เล่นเพลงต่อได้เลย
      })
      // ตั้ง showingPreHomeAd=true พร้อมกับ isLoggedIn=true เพื่อกัน race condition กับ AuthGuard
      // เรียกตอน loginThunk fulfilled เพื่อให้ AuthGuard รู้ว่าต้องรอโฆษณาก่อนเข้า home
      .addCase(loginThunk.fulfilled, (state, action) => {
        const user = (action.payload as any)?.user;
        if (user && !user.isPremium) {
          // user ที่ไม่ใช่ premium ต้องดูโฆษณาก่อนเข้าหน้าหลัก
          state.showingPreHomeAd = true;
        }
        // premium user → ไม่แสดงโฆษณา ไม่เปลี่ยน showingPreHomeAd
      });
  },
});

// export action creators สำหรับ component ใช้
export const { dismissAd, setPendingNextSong, setShowingPreHomeAd } = adsSlice.actions;
// export reducer เพื่อนำไปลงทะเบียนใน store
export default adsSlice.reducer;
