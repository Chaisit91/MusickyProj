// Redux store ของ WebAdmin — มีเฉพาะ authReducer | export RootState, AppDispatch
//
// หลักการทำงาน:
// 1. configureStore รวม auth reducer เพียงตัวเดียว (ข้อมูลอื่นดึง API โดยตรงผ่าน hooks)
// 2. export RootState, AppDispatch สำหรับ type-safe dispatch + selector

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.store";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;