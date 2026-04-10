import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, logoutApi, fetchMeApi, updateProfileApi, googleLoginApi, AuthUser, LoginPayload } from "../api/authApi";
import { setCachedToken } from "../api/apiClient";

// ─── State ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Restore session + sync latest user data from API
export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  const token = await AsyncStorage.getItem("accessToken");
  const userJson = await AsyncStorage.getItem("user");
  if (!token || !userJson) return null;

  setCachedToken(token);
  const cachedUser = JSON.parse(userJson) as AuthUser;

  // ดึง user ล่าสุดจาก API เพื่อให้ avatarUrl และ name เป็นปัจจุบัน
  try {
    const res = await fetchMeApi();
    const freshUser = res.data;
    await AsyncStorage.setItem("user", JSON.stringify(freshUser));
    return { accessToken: token, user: freshUser };
  } catch {
    // ถ้า API ล้มเหลว ใช้ข้อมูลใน cache แทน
    return { accessToken: token, user: cachedUser };
  }
});

// Google Login
export const googleLoginThunk = createAsyncThunk(
  "auth/googleLogin",
  async (params: { accessToken: string; name?: string }, { rejectWithValue }) => {
    try {
      const res = await googleLoginApi(params);
      if (res.requiresName) {
        // ต้องตั้งชื่อก่อน → return googleData ให้ caller จัดการ navigate
        return { requiresName: true as const, googleData: res.googleData! };
      }
      const { accessToken, refreshToken, user } = res.data!;
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setCachedToken(accessToken);
      return { requiresName: false as const, accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Google login failed");
    }
  }
);

// Fetch latest user from API (call after focus on profile screens)
export const fetchMeThunk = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchMeApi();
    const user = res.data;
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "Failed to fetch user");
  }
});

// Login
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await loginApi(payload);
      const { accessToken, refreshToken, user } = res.data;
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setCachedToken(accessToken);
      return { accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Login failed");
    }
  }
);

// Update Profile
export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (
    params: { name?: string; avatarUri?: string; avatarMimeType?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await updateProfileApi(params);
      const user = res.data;
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Update failed");
    }
  }
);

// Logout
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutApi();
  } catch {
    // proceed even if API fails
  }
  setCachedToken(null);
  await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // restoreSession
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isLoggedIn = true;
        }
        state.isLoading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
      });

    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isLoggedIn = true;
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    // googleLogin
    builder
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        if (!action.payload.requiresName) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.isLoggedIn = true;
        }
        // requiresName=true → state ไม่เปลี่ยน รอให้ตั้งชื่อก่อน
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // fetchMe
    builder.addCase(fetchMeThunk.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // updateProfile
    builder
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.isLoading = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
