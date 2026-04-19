// Redux slice การแจ้งเตือน — state: items[], unreadCount | thunks: fetchNotifications, markAllRead, deleteNotification | ล้าง state เมื่อ logout
//
// หลักการทำงาน:
// 1. fetchNotifications thunk: GET /notifications → เก็บ items[] ลง state
// 2. markNotificationRead thunk: PATCH /notifications/:id/read → อัปเดต item.isRead=true ใน state
// 3. markAllNotificationsRead thunk: PATCH /notifications/read-all → forEach item.isRead=true
// 4. state.isLoading ใช้แสดง spinner, state.error ใช้แสดงข้อความ error

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AppNotification,
  getNotificationsApi,
  markReadApi,
  markAllReadApi,
} from "../api/notificationsApi";

interface NotificationsState {
  items: AppNotification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotificationsApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to load notifications");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await markReadApi(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Failed");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllReadApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Failed");
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item) item.isRead = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
      });
  },
});

export default notificationsSlice.reducer;
