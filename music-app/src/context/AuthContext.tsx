import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, logoutApi, AuthUser, LoginPayload } from "../api/authApi";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoggedIn: false,
    isLoading: true,
  });

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const userJson = await AsyncStorage.getItem("user");
        if (token && userJson) {
          setState({
            accessToken: token,
            user: JSON.parse(userJson),
            isLoggedIn: true,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    await AsyncStorage.setItem("accessToken", res.data.accessToken);
    await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
    await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
    setState({
      accessToken: res.data.accessToken,
      user: res.data.user,
      isLoggedIn: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // proceed even if API fails
    }
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
    setState({ user: null, accessToken: null, isLoggedIn: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
