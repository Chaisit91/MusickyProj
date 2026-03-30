import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, logoutApi, AuthUser, LoginPayload } from "../api/authApi";

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

// Restore session from AsyncStorage on app start
export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  const token = await AsyncStorage.getItem("accessToken");
  const userJson = await AsyncStorage.getItem("user");
  if (token && userJson) {
    return { accessToken: token, user: JSON.parse(userJson) as AuthUser };
  }
  return null;
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
      return { accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Login failed");
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
