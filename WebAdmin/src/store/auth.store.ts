// Auth slice ของ WebAdmin — state: user, accessToken, isAuthenticated | actions: setCredentials, clearCredentials | persist token ลง localStorage
//
// หลักการทำงาน:
// 1. initialState: อ่าน user จาก localStorage, accessToken เป็น null (ต้อง refresh เสมอ)
// 2. loginThunk: เรียก adminLoginApi → บันทึก user ลง localStorage + accessToken ใน memory
// 3. logoutThunk: เรียก logoutApi → ล้าง user+token ออกจาก state + localStorage
// 4. refreshTokenThunk: เรียก refreshApi ผ่าน HttpOnly Cookie → อัปเดต accessToken ใน memory
// 5. เมื่อ refresh ล้มเหลว: ล้าง state + localStorage ทั้งหมด (force re-login)

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

const savedUser = localStorage.getItem("admin_user");
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
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
        localStorage.setItem("admin_user", JSON.stringify(action.payload.user));
        if (action.payload.refreshToken) {
          localStorage.setItem("admin_refresh_token", action.payload.refreshToken);
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Logout ───────────────────────────────────────────────
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("admin_user");
        localStorage.removeItem("admin_refresh_token");
      })

      // ── Silent Refresh ───────────────────────────────────────
      .addCase(refreshTokenThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.accessToken = action.payload.accessToken;
        if (action.payload.user) {
          state.user = action.payload.user;
          localStorage.setItem("admin_user", JSON.stringify(action.payload.user));
        }
        if (action.payload.refreshToken) {
          localStorage.setItem("admin_refresh_token", action.payload.refreshToken);
        }
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("admin_user");
        localStorage.removeItem("admin_refresh_token");
      });
  },
});

export const { clearError, setAccessToken } = authSlice.actions;
export default authSlice.reducer;