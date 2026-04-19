// Redux slice ตรวจสอบการเชื่อมต่อ — state: isOnline (true/false) | อัปเดตผ่าน NetInfo listener ใน _layout.tsx
//
// หลักการทำงาน:
// 1. state.isOnline เริ่มต้น true
// 2. setOnline(boolean) action: อัปเดต isOnline ตาม NetInfo event ที่ OfflineBanner component subscribe
// 3. slice นี้ไม่มี async thunk — เป็น simple flag ที่ component อ่านเพื่อตัดสิน behavior

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NetworkState {
  isOnline: boolean;
}

const initialState: NetworkState = {
  isOnline: true,
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
  },
});

export const { setOnline } = networkSlice.actions;
export default networkSlice.reducer;
