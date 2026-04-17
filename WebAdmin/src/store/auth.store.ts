import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { adminLoginApi, logoutApi, refreshApi } from "../api/authApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null; //  เก็บใน memory เท่านั้น ไม่มี localStorage
  loading: boolean;
  error: string | null;
}

//  ไม่มี initialState จาก localStorage แล้ว — ทุกอย่างเริ่มที่ null
const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await adminLoginApi(email, password);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      //  ไม่ต้องส่ง refreshToken — backend อ่านจาก HttpOnly Cookie เอง
      await logoutApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

//  silent refresh — เรียกตอน accessToken หมดอายุ (401) อัตโนมัติจาก axios interceptor
export const refreshTokenThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await refreshApi();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Refresh failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ────────────────────────────────────────────────
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        //  ไม่มี localStorage.setItem แล้ว
        // refreshToken ถูก set เป็น HttpOnly Cookie โดย backend อัตโนมัติ
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Logout ───────────────────────────────────────────────
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        //  ไม่ต้อง clear localStorage
        // refreshToken Cookie ถูก clear โดย backend อัตโนมัติ
      })

      // ── Silent Refresh ───────────────────────────────────────
      .addCase(refreshTokenThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.accessToken = action.payload.accessToken;
        if (action.payload.user) state.user = action.payload.user;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        // refresh ไม่ได้ (cookie หมดอายุ หรือไม่มี) → clear state
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { clearError, setAccessToken } = authSlice.actions;
export default authSlice.reducer;