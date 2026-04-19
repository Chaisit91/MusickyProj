// Redux store หลัก — รวม reducer ทั้งหมด (auth, player, library, preferences, ads, notifications, network, skip) | export RootState, AppDispatch
//
// หลักการทำงาน:
// 1. configureStore รวม reducer ทั้งหมด 8 slice: auth, player, library, preferences, notifications, ads, network, skip
// 2. export RootState = ReturnType<typeof store.getState> → type ของ state ทั้งหมด
// 3. export AppDispatch = typeof store.dispatch → type ที่รองรับ async thunk

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import playerReducer from "./playerSlice";
import libraryReducer from "./librarySlice";
import preferencesReducer from "./preferencesSlice";
import notificationsReducer from "./notificationsSlice";
import adsReducer from "./adsSlice";
import networkReducer from "./networkSlice";
import skipReducer from "./skipSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    library: libraryReducer,
    preferences: preferencesReducer,
    notifications: notificationsReducer,
    ads: adsReducer,
    network: networkReducer,
    skip: skipReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
