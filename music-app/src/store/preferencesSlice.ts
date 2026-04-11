import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPreferencesApi, updatePreferencesApi, UserPreferences } from "../api/preferencesApi";
import { logoutThunk } from "./authSlice";

const DEFAULT: UserPreferences = {
  streamingQuality: "Normal",
  downloadQuality: "High",
  musicLanguages: ["English", "Thai"],
  autoPlay: true,
  showLyrics: false,
};

interface PreferencesState extends UserPreferences {
  isLoaded: boolean;
}

const initialState: PreferencesState = {
  ...DEFAULT,
  isLoaded: false,
};

// โหลด preferences จาก backend (เรียกหลัง login)
export const loadPreferences = createAsyncThunk(
  "preferences/load",
  async (_, { rejectWithValue }) => {
    try {
      const prefs = await getPreferencesApi();
      // sync ลง AsyncStorage ด้วยเพื่อให้ AudioController อ่านได้แบบ sync
      await AsyncStorage.setItem("pref_autoPlay", String(prefs.autoPlay));
      await AsyncStorage.setItem("pref_showLyrics", String(prefs.showLyrics));
      return prefs;
    } catch {
      // ถ้า API ล้มเหลว ใช้ค่า default
      return rejectWithValue("Failed to load preferences");
    }
  }
);

// บันทึก preference บางส่วนไป backend
export const savePreferences = createAsyncThunk(
  "preferences/save",
  async (prefs: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      const updated = await updatePreferencesApi(prefs);
      // sync ลง AsyncStorage
      if (prefs.autoPlay !== undefined)
        await AsyncStorage.setItem("pref_autoPlay", String(prefs.autoPlay));
      if (prefs.showLyrics !== undefined)
        await AsyncStorage.setItem("pref_showLyrics", String(prefs.showLyrics));
      return updated;
    } catch {
      return rejectWithValue("Failed to save preferences");
    }
  }
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    // update local state ทันที (optimistic) ก่อน API จะตอบ
    setPreferenceLocal(state, action) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadPreferences.fulfilled, (state, action) => {
      return { ...action.payload, isLoaded: true };
    });
    builder.addCase(loadPreferences.rejected, (state) => {
      state.isLoaded = true;
    });
    builder.addCase(savePreferences.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    builder.addCase(logoutThunk.fulfilled, () => ({
      ...DEFAULT,
      isLoaded: false,
    }));
  },
});

export const { setPreferenceLocal } = preferencesSlice.actions;
export default preferencesSlice.reducer;
