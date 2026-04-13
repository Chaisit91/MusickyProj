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
